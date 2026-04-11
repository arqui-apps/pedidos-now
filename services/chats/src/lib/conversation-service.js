import { prisma } from './prisma';

const REQUESTER_TYPES = ['CUSTOMER', 'COURIER', 'BUSINESS'];
const CASE_TYPES = ['ORDER', 'DELIVERY', 'BUSINESS_CASE', 'OTHER'];
const CONVERSATION_STATUSES = [
  'OPEN',
  'IN_QUEUE',
  'RESOLVED_NO_SOLUTION',
  'RESOLVED_COUPON',
  'RESOLVED_REFUND',
  'CLOSED_TIMEOUT',
  'CLOSED_MANUAL',
  'CLOSED_OUT_OF_HOURS',
];

function createAppError(code, message, status = 400) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parsePositiveInt(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createAppError(
      'VALIDATION_ERROR',
      'inactivity_minutes debe ser un entero positivo.',
      400
    );
  }

  return parsed;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getGuatemalaNow() {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' })
  );
}

function timeValueToMinutes(value) {
  const date = value instanceof Date ? value : new Date(value);
  return (date.getUTCHours() * 60) + date.getUTCMinutes();
}

function normalizeTimeString(value) {
  const time = normalizeOptionalString(value);

  if (!time || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    throw createAppError(
      'VALIDATION_ERROR',
      'La hora debe tener formato HH:mm o HH:mm:ss.',
      400
    );
  }

  return time.length === 5 ? `${time}:00` : time;
}

function timeStringToDate(value) {
  const normalized = normalizeTimeString(value);
  return new Date(`1970-01-01T${normalized}.000Z`);
}

function formatTimeValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function serializeAvailability(item) {
  if (!item) return item;

  return {
    ...item,
    start_time: formatTimeValue(item.start_time),
    end_time: formatTimeValue(item.end_time),
  };
}

function validateCreateConversationPayload(payload = {}) {
  const requester_type = normalizeOptionalString(payload.requester_type);
  const requester_ext_id = normalizeOptionalString(payload.requester_ext_id);
  const requester_display_name = normalizeOptionalString(payload.requester_display_name);
  const case_type = normalizeOptionalString(payload.case_type) || 'OTHER';
  const case_reference = normalizeOptionalString(payload.case_reference);
  const subject = normalizeOptionalString(payload.subject);
  const inactivity_minutes = parsePositiveInt(payload.inactivity_minutes, 5);

  if (!requester_type || !REQUESTER_TYPES.includes(requester_type)) {
    throw createAppError(
      'VALIDATION_ERROR',
      `requester_type debe ser uno de: ${REQUESTER_TYPES.join(', ')}.`,
      400
    );
  }

  if (!requester_ext_id) {
    throw createAppError(
      'VALIDATION_ERROR',
      'requester_ext_id es obligatorio.',
      400
    );
  }

  if (!CASE_TYPES.includes(case_type)) {
    throw createAppError(
      'VALIDATION_ERROR',
      `case_type debe ser uno de: ${CASE_TYPES.join(', ')}.`,
      400
    );
  }

  return {
    requester_type,
    requester_ext_id,
    requester_display_name,
    case_type,
    case_reference,
    subject,
    inactivity_minutes,
  };
}

async function resolveAvailability() {
  const gtNow = getGuatemalaNow();
  const dayOfWeek = gtNow.getDay();
  const currentMinutes = gtNow.getHours() * 60 + gtNow.getMinutes();

  const availability = await prisma.chat_availability.findFirst({
    where: {
      day_of_week: dayOfWeek,
      enabled: true,
      deleted_at: null,
    },
  });

  if (!availability) {
    return {
      inHours: false,
      rule: null,
      gtNow,
    };
  }

  const startMinutes = timeValueToMinutes(availability.start_time);
  const endMinutes = timeValueToMinutes(availability.end_time);

  return {
    inHours: currentMinutes >= startMinutes && currentMinutes < endMinutes,
    rule: availability,
    gtNow,
  };
}

function parseDateFilter(value, endOfDay = false) {
  if (!value) return null;

  const trimmed = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
    const date = new Date(`${trimmed}${suffix}`);

    if (Number.isNaN(date.getTime())) {
      throw createAppError('VALIDATION_ERROR', `Fecha inválida: ${value}`, 400);
    }

    return date;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    throw createAppError('VALIDATION_ERROR', `Fecha inválida: ${value}`, 400);
  }

  return date;
}

function buildConversationWhere(filters = {}) {
  const where = {
    deleted_at: null,
  };

  if (filters.status) {
    if (!CONVERSATION_STATUSES.includes(filters.status)) {
      throw createAppError(
        'VALIDATION_ERROR',
        `status debe ser uno de: ${CONVERSATION_STATUSES.join(', ')}.`,
        400
      );
    }
    where.status = filters.status;
  }

  if (filters.requester_type) {
    if (!REQUESTER_TYPES.includes(filters.requester_type)) {
      throw createAppError(
        'VALIDATION_ERROR',
        `requester_type debe ser uno de: ${REQUESTER_TYPES.join(', ')}.`,
        400
      );
    }
    where.requester_type = filters.requester_type;
  }

  if (filters.case_type) {
    if (!CASE_TYPES.includes(filters.case_type)) {
      throw createAppError(
        'VALIDATION_ERROR',
        `case_type debe ser uno de: ${CASE_TYPES.join(', ')}.`,
        400
      );
    }
    where.case_type = filters.case_type;
  }

  if (filters.assigned_agent_ext_id) {
    where.assigned_agent_ext_id = String(filters.assigned_agent_ext_id).trim();
  }

  const fromDate = parseDateFilter(filters.from_date, false);
  const toDate = parseDateFilter(filters.to_date, true);

  if (fromDate || toDate) {
    where.opened_at = {};
    if (fromDate) where.opened_at.gte = fromDate;
    if (toDate) where.opened_at.lte = toDate;
  }

  return where;
}

function isFinalStatus(status) {
  return [
    'RESOLVED_NO_SOLUTION',
    'RESOLVED_COUPON',
    'RESOLVED_REFUND',
    'CLOSED_TIMEOUT',
    'CLOSED_MANUAL',
    'CLOSED_OUT_OF_HOURS',
  ].includes(status);
}

function isResolvedStatus(status) {
  return ['RESOLVED_NO_SOLUTION', 'RESOLVED_COUPON', 'RESOLVED_REFUND'].includes(status);
}

function getAllowedNextStatuses(currentStatus) {
  if (currentStatus === 'IN_QUEUE') {
    return ['OPEN'];
  }

  if (currentStatus === 'OPEN') {
    return [
      'RESOLVED_NO_SOLUTION',
      'RESOLVED_COUPON',
      'RESOLVED_REFUND',
      'CLOSED_TIMEOUT',
      'CLOSED_MANUAL',
    ];
  }

  return [];
}

export async function createConversation(payload) {
  const data = validateCreateConversationPayload(payload);
  const availabilityResult = await resolveAvailability();
  const openedAt = availabilityResult.gtNow;

  const inHours = availabilityResult.inHours;
  const initialStatus = inHours ? 'IN_QUEUE' : 'CLOSED_OUT_OF_HOURS';
  const initialCloseReason = inHours ? null : 'OUT_OF_HOURS';

  const autoMessageType = inHours ? 'AUTO_OPEN' : 'AUTO_OUT_OF_HOURS';
  const autoMessageContent = inHours
    ? 'Tu chat fue abierto correctamente. En breve te atenderá un agente.'
    : 'Estamos fuera de horario. Tu solicitud fue registrada como fuera de horario.';

  const createdConversation = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversations.create({
      data: {
        requester_type: data.requester_type,
        requester_ext_id: data.requester_ext_id,
        case_type: data.case_type,
        case_reference: data.case_reference,
        subject: data.subject,
        status: initialStatus,
        opened_at: openedAt,
        inactivity_minutes: data.inactivity_minutes,
        is_live: inHours,
        out_of_hours: !inHours,
        close_reason: initialCloseReason,
        closed_at: inHours ? null : openedAt,
      },
    });

    await tx.participants.create({
      data: {
        conversation_id: conversation.id,
        participant_ext_id: data.requester_ext_id,
        role: 'USER',
        display_name: data.requester_display_name,
      },
    });

    await tx.status_history.create({
      data: {
        conversation_id: conversation.id,
        previous_status: null,
        new_status: initialStatus,
        changed_by_role: 'SYSTEM',
        changed_by_ext_id: null,
        reason: inHours
          ? 'Conversación creada dentro de horario.'
          : 'Conversación creada fuera de horario.',
      },
    });

    await tx.metrics.upsert({
      where: {
        conversation_id: conversation.id,
      },
      update: {
        deleted_at: null,
      },
      create: {
        conversation_id: conversation.id,
      },
    });

    await tx.messages.create({
      data: {
        conversation_id: conversation.id,
        sender_role: 'SYSTEM',
        sender_ext_id: null,
        message_type: autoMessageType,
        content: autoMessageContent,
      },
    });

    if (!inHours) {
      await tx.conversations.update({
        where: { id: conversation.id },
        data: {
          inactivity_deadline_at: null,
        },
      });
    }

    return tx.conversations.findFirst({
      where: {
        id: conversation.id,
        deleted_at: null,
      },
      include: {
        participants: {
          where: { deleted_at: null },
          orderBy: { joined_at: 'asc' },
        },
        metrics: true,
      },
    });
  });

  return createdConversation;
}

export async function listConversations(filters = {}) {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 10)));
  const skip = (page - 1) * limit;

  const where = buildConversationWhere(filters);

  const [items, total] = await prisma.$transaction([
    prisma.conversations.findMany({
      where,
      include: {
        participants: {
          where: { deleted_at: null },
          orderBy: { joined_at: 'asc' },
        },
        metrics: true,
      },
      orderBy: {
        last_activity_at: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.conversations.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
    filters: {
      status: filters.status || null,
      requester_type: filters.requester_type || null,
      assigned_agent_ext_id: filters.assigned_agent_ext_id || null,
      case_type: filters.case_type || null,
      from_date: filters.from_date || null,
      to_date: filters.to_date || null,
    },
  };
}

export async function getConversationById(conversationId) {
  const id = normalizeOptionalString(conversationId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'conversationId es obligatorio.', 400);
  }

  const conversation = await prisma.conversations.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      participants: {
        where: { deleted_at: null },
        orderBy: { joined_at: 'asc' },
      },
      metrics: true,
      status_history: {
        where: { deleted_at: null },
        orderBy: { changed_at: 'asc' },
      },
    },
  });

  if (!conversation) {
    throw createAppError(
      'CONVERSATION_NOT_FOUND',
      'Conversación no encontrada.',
      404
    );
  }

  return conversation;
}

export async function assignAgentToConversation(conversationId, payload = {}) {
  const id = normalizeOptionalString(conversationId);
  const agent_ext_id = normalizeOptionalString(payload.agent_ext_id);
  const agent_display_name = normalizeOptionalString(payload.agent_display_name);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'conversationId es obligatorio.', 400);
  }

  if (!agent_ext_id) {
    throw createAppError('VALIDATION_ERROR', 'agent_ext_id es obligatorio.', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversations.findFirst({
      where: { id, deleted_at: null },
      include: {
        participants: {
          where: { deleted_at: null },
        },
      },
    });

    if (!conversation) {
      throw createAppError('CONVERSATION_NOT_FOUND', 'Conversación no encontrada.', 404);
    }

    if (conversation.status !== 'IN_QUEUE') {
      throw createAppError(
        'INVALID_STATUS_TRANSITION',
        'Solo se puede asignar agente a conversaciones en estado IN_QUEUE.',
        409
      );
    }

    const activeAgent = conversation.participants.find((p) => p.role === 'AGENT');

    if (activeAgent && activeAgent.participant_ext_id !== agent_ext_id) {
      throw createAppError(
        'AGENT_ALREADY_ASSIGNED',
        'La conversación ya tiene un agente asignado.',
        409
      );
    }

    const now = new Date();
    const inactivityDeadline = addMinutes(now, conversation.inactivity_minutes);

    await tx.participants.upsert({
      where: {
        conversation_id_participant_ext_id: {
          conversation_id: id,
          participant_ext_id: agent_ext_id,
        },
      },
      update: {
        role: 'AGENT',
        display_name: agent_display_name,
        left_at: null,
        deleted_at: null,
      },
      create: {
        conversation_id: id,
        participant_ext_id: agent_ext_id,
        role: 'AGENT',
        display_name: agent_display_name,
      },
    });

    await tx.conversations.update({
      where: { id },
      data: {
        assigned_agent_ext_id: agent_ext_id,
        status: 'OPEN',
        is_live: true,
        last_activity_at: now,
        inactivity_deadline_at: inactivityDeadline,
        updated_at: now,
      },
    });

    await tx.status_history.create({
      data: {
        conversation_id: id,
        previous_status: conversation.status,
        new_status: 'OPEN',
        changed_by_role: 'AGENT',
        changed_by_ext_id: agent_ext_id,
        reason: 'Agente asignado a la conversación.',
      },
    });

    await tx.events.create({
      data: {
        conversation_id: id,
        event_type: 'AGENT_ASSIGNED',
        payload: {
          agent_ext_id,
          agent_display_name,
        },
      },
    });

    return tx.conversations.findFirst({
      where: { id, deleted_at: null },
      include: {
        participants: {
          where: { deleted_at: null },
          orderBy: { joined_at: 'asc' },
        },
        metrics: true,
        status_history: {
          where: { deleted_at: null },
          orderBy: { changed_at: 'asc' },
        },
      },
    });
  });

  return result;
}

export async function changeConversationStatus(conversationId, payload = {}) {
  const id = normalizeOptionalString(conversationId);
  const new_status = normalizeOptionalString(payload.new_status);
  const changed_by_ext_id = normalizeOptionalString(payload.changed_by_ext_id);
  const reason = normalizeOptionalString(payload.reason);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'conversationId es obligatorio.', 400);
  }

  if (!new_status || !CONVERSATION_STATUSES.includes(new_status)) {
    throw createAppError(
      'VALIDATION_ERROR',
      `new_status debe ser uno de: ${CONVERSATION_STATUSES.join(', ')}.`,
      400
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversations.findFirst({
      where: { id, deleted_at: null },
      include: { metrics: true },
    });

    if (!conversation) {
      throw createAppError('CONVERSATION_NOT_FOUND', 'Conversación no encontrada.', 404);
    }

    const allowedNext = getAllowedNextStatuses(conversation.status);

    if (!allowedNext.includes(new_status)) {
      throw createAppError(
        'INVALID_STATUS_TRANSITION',
        `No se permite cambiar de ${conversation.status} a ${new_status}.`,
        409
      );
    }

    const now = new Date();

    const updateData = {
      status: new_status,
      updated_at: now,
    };

    if (isFinalStatus(new_status)) {
      updateData.is_live = false;
      updateData.closed_at = now;
      updateData.inactivity_deadline_at = null;
    }

    if (new_status === 'CLOSED_TIMEOUT') {
      updateData.close_reason = 'TIMEOUT';
    } else if (new_status === 'CLOSED_MANUAL') {
      updateData.close_reason = 'MANUAL';
    } else if (isResolvedStatus(new_status)) {
      updateData.close_reason = 'SYSTEM';
    }

    await tx.conversations.update({
      where: { id },
      data: updateData,
    });

    await tx.status_history.create({
      data: {
        conversation_id: id,
        previous_status: conversation.status,
        new_status,
        changed_by_role: 'AGENT',
        changed_by_ext_id,
        reason,
      },
    });

    if (isFinalStatus(new_status)) {
      const timeToCloseMs = Math.max(
        0,
        now.getTime() - new Date(conversation.opened_at).getTime()
      );

      await tx.metrics.upsert({
        where: { conversation_id: id },
        update: {
          resolved_at: now,
          time_to_close_ms: timeToCloseMs,
          deleted_at: null,
        },
        create: {
          conversation_id: id,
          resolved_at: now,
          time_to_close_ms: timeToCloseMs,
        },
      });
    }

    if (new_status === 'CLOSED_TIMEOUT' || new_status === 'CLOSED_MANUAL') {
      await tx.messages.create({
        data: {
          conversation_id: id,
          sender_role: 'SYSTEM',
          sender_ext_id: null,
          message_type: 'AUTO_CLOSE',
          content:
            new_status === 'CLOSED_TIMEOUT'
              ? 'El chat fue cerrado automáticamente por inactividad.'
              : 'El chat fue cerrado manualmente por un agente.',
        },
      });
    }

    await tx.events.create({
      data: {
        conversation_id: id,
        event_type: 'STATUS_CHANGED',
        payload: {
          previous_status: conversation.status,
          new_status,
          changed_by_ext_id,
          reason,
        },
      },
    });

    return tx.conversations.findFirst({
      where: { id, deleted_at: null },
      include: {
        participants: {
          where: { deleted_at: null },
          orderBy: { joined_at: 'asc' },
        },
        metrics: true,
        status_history: {
          where: { deleted_at: null },
          orderBy: { changed_at: 'asc' },
        },
      },
    });
  });

  return result;
}

export async function closeExpiredConversations({ limit = 50 } = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number(limit || 50)));
  const now = new Date();

  const expiredConversations = await prisma.conversations.findMany({
    where: {
      deleted_at: null,
      status: 'OPEN',
      inactivity_deadline_at: {
        not: null,
        lte: now,
      },
    },
    orderBy: {
      inactivity_deadline_at: 'asc',
    },
    take: safeLimit,
    include: {
      metrics: true,
    },
  });

  if (expiredConversations.length === 0) {
    return {
      processed: 0,
      closed: 0,
      items: [],
      timestamp: now,
    };
  }

  const results = [];

  for (const conversation of expiredConversations) {
    const updatedConversation = await prisma.$transaction(async (tx) => {
      const freshConversation = await tx.conversations.findFirst({
        where: {
          id: conversation.id,
          deleted_at: null,
        },
        include: {
          metrics: true,
        },
      });

      if (!freshConversation) {
        return null;
      }

      if (
        freshConversation.status !== 'OPEN' ||
        !freshConversation.inactivity_deadline_at ||
        new Date(freshConversation.inactivity_deadline_at).getTime() > now.getTime()
      ) {
        return null;
      }

      await tx.conversations.update({
        where: { id: freshConversation.id },
        data: {
          status: 'CLOSED_TIMEOUT',
          close_reason: 'TIMEOUT',
          closed_at: now,
          is_live: false,
          inactivity_deadline_at: null,
          updated_at: now,
        },
      });

      await tx.status_history.create({
        data: {
          conversation_id: freshConversation.id,
          previous_status: freshConversation.status,
          new_status: 'CLOSED_TIMEOUT',
          changed_by_role: 'SYSTEM',
          changed_by_ext_id: null,
          reason: 'Cierre automático por inactividad.',
        },
      });

      await tx.messages.create({
        data: {
          conversation_id: freshConversation.id,
          sender_role: 'SYSTEM',
          sender_ext_id: null,
          message_type: 'AUTO_CLOSE',
          content: 'El chat fue cerrado automáticamente por inactividad.',
        },
      });

      const timeToCloseMs = Math.max(
        0,
        now.getTime() - new Date(freshConversation.opened_at).getTime()
      );

      await tx.metrics.upsert({
        where: {
          conversation_id: freshConversation.id,
        },
        update: {
          resolved_at: now,
          time_to_close_ms: timeToCloseMs,
          deleted_at: null,
        },
        create: {
          conversation_id: freshConversation.id,
          resolved_at: now,
          time_to_close_ms: timeToCloseMs,
        },
      });

      await tx.events.create({
        data: {
          conversation_id: freshConversation.id,
          event_type: 'STATUS_CHANGED',
          payload: {
            previous_status: freshConversation.status,
            new_status: 'CLOSED_TIMEOUT',
            changed_by_ext_id: null,
            reason: 'Cierre automático por inactividad.',
            automatic: true,
          },
        },
      });

      await tx.events.create({
        data: {
          conversation_id: freshConversation.id,
          event_type: 'AUTO_TIMEOUT_CLOSED',
          payload: {
            inactivity_deadline_at: freshConversation.inactivity_deadline_at,
            closed_at: now,
          },
        },
      });

      return tx.conversations.findFirst({
        where: {
          id: freshConversation.id,
          deleted_at: null,
        },
        include: {
          participants: {
            where: { deleted_at: null },
            orderBy: { joined_at: 'asc' },
          },
          metrics: true,
          status_history: {
            where: { deleted_at: null },
            orderBy: { changed_at: 'asc' },
          },
        },
      });
    });

    if (updatedConversation) {
      results.push(updatedConversation);
    }
  }

  return {
    processed: expiredConversations.length,
    closed: results.length,
    items: results,
    timestamp: now,
  };
}

function validateAvailabilityPayload(payload = {}, { partial = false } = {}) {
  const parsed = {};

  if (!partial || payload.day_of_week !== undefined) {
    const dayOfWeek = Number(payload.day_of_week);

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      throw createAppError(
        'VALIDATION_ERROR',
        'day_of_week debe ser un entero entre 0 y 6.',
        400
      );
    }

    parsed.day_of_week = dayOfWeek;
  }

  if (!partial || payload.start_time !== undefined) {
    parsed.start_time = timeStringToDate(payload.start_time);
  }

  if (!partial || payload.end_time !== undefined) {
    parsed.end_time = timeStringToDate(payload.end_time);
  }

  if (parsed.start_time && parsed.end_time) {
    if (parsed.start_time.getTime() >= parsed.end_time.getTime()) {
      throw createAppError(
        'VALIDATION_ERROR',
        'start_time debe ser menor que end_time.',
        400
      );
    }
  }

  if (!partial || payload.enabled !== undefined) {
    if (typeof payload.enabled !== 'boolean') {
      throw createAppError(
        'VALIDATION_ERROR',
        'enabled debe ser boolean.',
        400
      );
    }

    parsed.enabled = payload.enabled;
  }

  if (!partial || payload.timezone !== undefined) {
    const timezone = normalizeOptionalString(payload.timezone) || 'America/Guatemala';
    parsed.timezone = timezone;
  }

  return parsed;
}

export async function createAvailability(payload = {}) {
  const data = validateAvailabilityPayload(payload);

  const exists = await prisma.chat_availability.findFirst({
    where: {
      day_of_week: data.day_of_week,
      deleted_at: null,
    },
  });

  if (exists) {
    throw createAppError(
      'AVAILABILITY_ALREADY_EXISTS',
      `Ya existe un horario activo para el día ${data.day_of_week}.`,
      409
    );
  }

  const created = await prisma.chat_availability.create({
    data,
  });

  return serializeAvailability(created);
}

export async function listAvailability() {
  const items = await prisma.chat_availability.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      day_of_week: 'asc',
    },
  });

  return items.map(serializeAvailability);
}

export async function getAvailabilityById(availabilityId) {
  const id = normalizeOptionalString(availabilityId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'availabilityId es obligatorio.', 400);
  }

  const item = await prisma.chat_availability.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!item) {
    throw createAppError(
      'AVAILABILITY_NOT_FOUND',
      'Horario no encontrado.',
      404
    );
  }

  return serializeAvailability(item);
}

export async function updateAvailability(availabilityId, payload = {}) {
  const id = normalizeOptionalString(availabilityId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'availabilityId es obligatorio.', 400);
  }

  const data = validateAvailabilityPayload(payload, { partial: true });

  if (Object.keys(data).length === 0) {
    throw createAppError(
      'VALIDATION_ERROR',
      'Debes enviar al menos un campo para actualizar.',
      400
    );
  }

  const current = await prisma.chat_availability.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!current) {
    throw createAppError(
      'AVAILABILITY_NOT_FOUND',
      'Horario no encontrado.',
      404
    );
  }

  const nextDayOfWeek = data.day_of_week ?? current.day_of_week;

  const duplicate = await prisma.chat_availability.findFirst({
    where: {
      day_of_week: nextDayOfWeek,
      deleted_at: null,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    throw createAppError(
      'AVAILABILITY_ALREADY_EXISTS',
      `Ya existe otro horario activo para el día ${nextDayOfWeek}.`,
      409
    );
  }

  const nextStartTime = data.start_time ?? current.start_time;
  const nextEndTime = data.end_time ?? current.end_time;

  if (nextStartTime.getTime() >= nextEndTime.getTime()) {
    throw createAppError(
      'VALIDATION_ERROR',
      'start_time debe ser menor que end_time.',
      400
    );
  }

  const updated = await prisma.chat_availability.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return serializeAvailability(updated);
}

export async function deleteAvailability(availabilityId) {
  const id = normalizeOptionalString(availabilityId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'availabilityId es obligatorio.', 400);
  }

  const current = await prisma.chat_availability.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!current) {
    throw createAppError(
      'AVAILABILITY_NOT_FOUND',
      'Horario no encontrado.',
      404
    );
  }

  const deleted = await prisma.chat_availability.update({
    where: { id },
    data: {
      enabled: false,
      deleted_at: new Date(),
      updated_at: new Date(),
    },
  });

  return serializeAvailability(deleted);
}