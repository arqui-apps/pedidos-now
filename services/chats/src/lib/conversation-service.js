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

function getGuatemalaNow() {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' })
  );
}

function timeValueToMinutes(value) {
  const date = value instanceof Date ? value : new Date(value);
  return (date.getUTCHours() * 60) + date.getUTCMinutes();
}

async function resolveAvailability() {
  const gtNow = getGuatemalaNow();
  const dayOfWeek = gtNow.getDay(); // 0 domingo, 6 sábado
  const currentMinutes = (gtNow.getHours() * 60) + gtNow.getMinutes();

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