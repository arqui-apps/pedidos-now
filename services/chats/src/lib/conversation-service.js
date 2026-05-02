// src/lib/conversation-service.js
import { query, execute, transaction } from './db';
import {
  emitConversationAssigned,
  emitConversationCreated,
  emitConversationStatusChanged,
  emitConversationUpdated,
} from './realtime';

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

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function toMysqlDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);

  const pad = (number) => String(number).padStart(2, '0');

  return (
    [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-') +
    ' ' +
    [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')
  );
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

function timeValueToMinutes(value) {
  if (!value) return 0;

  if (typeof value === 'string') {
    const [hh, mm] = value.split(':').map(Number);
    return hh * 60 + mm;
  }

  const date = value instanceof Date ? value : new Date(value);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function formatTimeValue(value) {
  if (!value) return value;

  if (typeof value === 'string') {
    return value.length === 5 ? `${value}:00` : value;
  }

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
  return ['RESOLVED_NO_SOLUTION', 'RESOLVED_COUPON', 'RESOLVED_REFUND'].includes(
    status
  );
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

function validateCreateConversationPayload(payload = {}) {
  const requester_type = normalizeOptionalString(payload.requester_type);
  const requester_ext_id = normalizeOptionalString(payload.requester_ext_id);
  const requester_display_name = normalizeOptionalString(
    payload.requester_display_name
  );
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

  const rows = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE day_of_week = ?
      AND enabled = true
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [dayOfWeek]
  );

  const availability = rows[0] || null;

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

function buildConversationWhereSql(filters = {}) {
  const conditions = ['c.deleted_at IS NULL'];
  const params = [];

  if (filters.status) {
    if (!CONVERSATION_STATUSES.includes(filters.status)) {
      throw createAppError(
        'VALIDATION_ERROR',
        `status debe ser uno de: ${CONVERSATION_STATUSES.join(', ')}.`,
        400
      );
    }

    conditions.push('c.status = ?');
    params.push(filters.status);
  }

  if (filters.requester_type) {
    if (!REQUESTER_TYPES.includes(filters.requester_type)) {
      throw createAppError(
        'VALIDATION_ERROR',
        `requester_type debe ser uno de: ${REQUESTER_TYPES.join(', ')}.`,
        400
      );
    }

    conditions.push('c.requester_type = ?');
    params.push(filters.requester_type);
  }

  if (filters.case_type) {
    if (!CASE_TYPES.includes(filters.case_type)) {
      throw createAppError(
        'VALIDATION_ERROR',
        `case_type debe ser uno de: ${CASE_TYPES.join(', ')}.`,
        400
      );
    }

    conditions.push('c.case_type = ?');
    params.push(filters.case_type);
  }

  if (filters.assigned_agent_ext_id) {
    conditions.push('c.assigned_agent_ext_id = ?');
    params.push(String(filters.assigned_agent_ext_id).trim());
  }

  const fromDate = parseDateFilter(filters.from_date, false);
  const toDate = parseDateFilter(filters.to_date, true);

  if (fromDate) {
    conditions.push('c.opened_at >= ?');
    params.push(toMysqlDateTime(fromDate));
  }

  if (toDate) {
    conditions.push('c.opened_at <= ?');
    params.push(toMysqlDateTime(toDate));
  }

  return {
    whereSql: conditions.join(' AND '),
    params,
  };
}

async function getConversationDetail(db, conversationId) {
  const conversationRows = await db.query(
    `
    SELECT *
    FROM conversations
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [conversationId]
  );

  const conversation = conversationRows[0];

  if (!conversation) return null;

  const participants = await db.query(
    `
    SELECT *
    FROM participants
    WHERE conversation_id = ?
      AND deleted_at IS NULL
    ORDER BY joined_at ASC
    `,
    [conversationId]
  );

  const metricsRows = await db.query(
    `
    SELECT *
    FROM metrics
    WHERE conversation_id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [conversationId]
  );

  const statusHistory = await db.query(
    `
    SELECT *
    FROM status_history
    WHERE conversation_id = ?
      AND deleted_at IS NULL
    ORDER BY changed_at ASC
    `,
    [conversationId]
  );

  return {
    ...conversation,
    participants,
    metrics: metricsRows[0] || null,
    status_history: statusHistory,
  };
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

  const createdConversation = await transaction(async (tx) => {
    const uuidRows = await tx.query('SELECT UUID() AS id, NOW() AS now_value');
    const conversationId = uuidRows[0].id;
    const nowValue = toDate(uuidRows[0].now_value);
    const openedAtValue = openedAt || nowValue;

    await tx.execute(
      `
      INSERT INTO conversations
        (
          id,
          requester_type,
          requester_ext_id,
          case_type,
          case_reference,
          subject,
          status,
          opened_at,
          last_activity_at,
          inactivity_minutes,
          is_live,
          out_of_hours,
          close_reason,
          closed_at,
          created_at,
          updated_at
        )
      VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        conversationId,
        data.requester_type,
        data.requester_ext_id,
        data.case_type,
        data.case_reference,
        data.subject,
        initialStatus,
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
        data.inactivity_minutes,
        inHours,
        !inHours,
        initialCloseReason,
        inHours ? null : toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
      ]
    );

    await tx.execute(
      `
      INSERT INTO participants
        (
          conversation_id,
          participant_ext_id,
          role,
          display_name,
          joined_at,
          created_at,
          updated_at
        )
      VALUES
        (?, ?, 'USER', ?, ?, ?, ?)
      `,
      [
        conversationId,
        data.requester_ext_id,
        data.requester_display_name,
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
      ]
    );

    await tx.execute(
      `
      INSERT INTO status_history
        (
          id,
          conversation_id,
          previous_status,
          new_status,
          changed_by_role,
          changed_by_ext_id,
          reason,
          changed_at,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          NULL,
          ?,
          'SYSTEM',
          NULL,
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        conversationId,
        initialStatus,
        inHours
          ? 'Conversación creada dentro de horario.'
          : 'Conversación creada fuera de horario.',
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
      ]
    );

    await tx.execute(
      `
      INSERT INTO metrics
        (
          conversation_id,
          created_at,
          updated_at
        )
      VALUES
        (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        deleted_at = NULL,
        updated_at = VALUES(updated_at)
      `,
      [
        conversationId,
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
      ]
    );

    await tx.execute(
      `
      INSERT INTO messages
        (
          id,
          conversation_id,
          sender_role,
          sender_ext_id,
          message_type,
          content,
          sent_at,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          'SYSTEM',
          NULL,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        conversationId,
        autoMessageType,
        autoMessageContent,
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
        toMysqlDateTime(openedAtValue),
      ]
    );

    if (!inHours) {
      await tx.execute(
        `
        UPDATE conversations
        SET inactivity_deadline_at = NULL
        WHERE id = ?
        `,
        [conversationId]
      );
    }

    return getConversationDetail(tx, conversationId);
  });

  emitConversationCreated(createdConversation);
  emitConversationUpdated(createdConversation);

  return createdConversation;
}

export async function listConversations(filters = {}) {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 10)));
  const skip = (page - 1) * limit;

  const { whereSql, params } = buildConversationWhereSql(filters);

  const items = await query(
    `
    SELECT c.*
    FROM conversations c
    WHERE ${whereSql}
    ORDER BY c.last_activity_at DESC
    LIMIT ${limit} OFFSET ${skip}
    `,
    params
  );

  const totalRows = await query(
    `
    SELECT COUNT(*) AS total
    FROM conversations c
    WHERE ${whereSql}
    `,
    params
  );

  const total = Number(totalRows[0]?.total || 0);

  for (const item of items) {
    const participants = await query(
      `
      SELECT *
      FROM participants
      WHERE conversation_id = ?
        AND deleted_at IS NULL
      ORDER BY joined_at ASC
      `,
      [item.id]
    );

    const metricsRows = await query(
      `
      SELECT *
      FROM metrics
      WHERE conversation_id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [item.id]
    );

    item.participants = participants;
    item.metrics = metricsRows[0] || null;
  }

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

  const conversation = await getConversationDetail(
    {
      query,
    },
    id
  );

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

  const result = await transaction(async (tx) => {
    const conversationRows = await tx.query(
      `
      SELECT *
      FROM conversations
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
      FOR UPDATE
      `,
      [id]
    );

    const conversation = conversationRows[0];

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

    const participants = await tx.query(
      `
      SELECT *
      FROM participants
      WHERE conversation_id = ?
        AND deleted_at IS NULL
      `,
      [id]
    );

    const activeAgent = participants.find((p) => p.role === 'AGENT');

    if (activeAgent && activeAgent.participant_ext_id !== agent_ext_id) {
      throw createAppError(
        'AGENT_ALREADY_ASSIGNED',
        'La conversación ya tiene un agente asignado.',
        409
      );
    }

    const now = new Date();
    const inactivityDeadline = addMinutes(now, Number(conversation.inactivity_minutes));

    await tx.execute(
      `
      INSERT INTO participants
        (
          conversation_id,
          participant_ext_id,
          role,
          display_name,
          joined_at,
          left_at,
          deleted_at,
          created_at,
          updated_at
        )
      VALUES
        (?, ?, 'AGENT', ?, ?, NULL, NULL, ?, ?)
      ON DUPLICATE KEY UPDATE
        role = 'AGENT',
        display_name = VALUES(display_name),
        left_at = NULL,
        deleted_at = NULL,
        updated_at = VALUES(updated_at)
      `,
      [
        id,
        agent_ext_id,
        agent_display_name,
        toMysqlDateTime(now),
        toMysqlDateTime(now),
        toMysqlDateTime(now),
      ]
    );

    await tx.execute(
      `
      UPDATE conversations
      SET
        assigned_agent_ext_id = ?,
        status = 'OPEN',
        is_live = true,
        last_activity_at = ?,
        inactivity_deadline_at = ?,
        updated_at = ?
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [
        agent_ext_id,
        toMysqlDateTime(now),
        toMysqlDateTime(inactivityDeadline),
        toMysqlDateTime(now),
        id,
      ]
    );

    await tx.execute(
      `
      INSERT INTO status_history
        (
          id,
          conversation_id,
          previous_status,
          new_status,
          changed_by_role,
          changed_by_ext_id,
          reason,
          changed_at,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          ?,
          'OPEN',
          'AGENT',
          ?,
          'Agente asignado a la conversación.',
          ?,
          ?,
          ?
        )
      `,
      [
        id,
        conversation.status,
        agent_ext_id,
        toMysqlDateTime(now),
        toMysqlDateTime(now),
        toMysqlDateTime(now),
      ]
    );

    await tx.execute(
      `
      INSERT INTO events
        (
          id,
          conversation_id,
          event_type,
          payload,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          'AGENT_ASSIGNED',
          CAST(? AS JSON),
          ?,
          ?
        )
      `,
      [
        id,
        JSON.stringify({
          agent_ext_id,
          agent_display_name,
        }),
        toMysqlDateTime(now),
        toMysqlDateTime(now),
      ]
    );

    return getConversationDetail(tx, id);
  });

  emitConversationAssigned(result);
  emitConversationUpdated(result);

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

  const result = await transaction(async (tx) => {
    const conversationRows = await tx.query(
      `
      SELECT *
      FROM conversations
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
      FOR UPDATE
      `,
      [id]
    );

    const conversation = conversationRows[0];

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

    const updateParts = ['status = ?', 'updated_at = ?'];
    const updateParams = [new_status, toMysqlDateTime(now)];

    if (isFinalStatus(new_status)) {
      updateParts.push('is_live = false');
      updateParts.push('closed_at = ?');
      updateParams.push(toMysqlDateTime(now));
      updateParts.push('inactivity_deadline_at = NULL');
    }

    if (new_status === 'CLOSED_TIMEOUT') {
      updateParts.push('close_reason = ?');
      updateParams.push('TIMEOUT');
    } else if (new_status === 'CLOSED_MANUAL') {
      updateParts.push('close_reason = ?');
      updateParams.push('MANUAL');
    } else if (isResolvedStatus(new_status)) {
      updateParts.push('close_reason = ?');
      updateParams.push('SYSTEM');
    }

    updateParams.push(id);

    await tx.execute(
      `
      UPDATE conversations
      SET ${updateParts.join(', ')}
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      updateParams
    );

    await tx.execute(
      `
      INSERT INTO status_history
        (
          id,
          conversation_id,
          previous_status,
          new_status,
          changed_by_role,
          changed_by_ext_id,
          reason,
          changed_at,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          ?,
          ?,
          'AGENT',
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        id,
        conversation.status,
        new_status,
        changed_by_ext_id,
        reason,
        toMysqlDateTime(now),
        toMysqlDateTime(now),
        toMysqlDateTime(now),
      ]
    );

    if (isFinalStatus(new_status)) {
      const timeToCloseMs = Math.max(
        0,
        now.getTime() - toDate(conversation.opened_at).getTime()
      );

      await tx.execute(
        `
        INSERT INTO metrics
          (
            conversation_id,
            resolved_at,
            time_to_close_ms,
            created_at,
            updated_at
          )
        VALUES
          (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          resolved_at = VALUES(resolved_at),
          time_to_close_ms = VALUES(time_to_close_ms),
          deleted_at = NULL,
          updated_at = VALUES(updated_at)
        `,
        [
          id,
          toMysqlDateTime(now),
          timeToCloseMs,
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );
    }

    if (new_status === 'CLOSED_TIMEOUT' || new_status === 'CLOSED_MANUAL') {
      await tx.execute(
        `
        INSERT INTO messages
          (
            id,
            conversation_id,
            sender_role,
            sender_ext_id,
            message_type,
            content,
            sent_at,
            created_at,
            updated_at
          )
        VALUES
          (
            UUID(),
            ?,
            'SYSTEM',
            NULL,
            'AUTO_CLOSE',
            ?,
            ?,
            ?,
            ?
          )
        `,
        [
          id,
          new_status === 'CLOSED_TIMEOUT'
            ? 'El chat fue cerrado automáticamente por inactividad.'
            : 'El chat fue cerrado manualmente por un agente.',
          toMysqlDateTime(now),
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );
    }

    await tx.execute(
      `
      INSERT INTO events
        (
          id,
          conversation_id,
          event_type,
          payload,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          'STATUS_CHANGED',
          CAST(? AS JSON),
          ?,
          ?
        )
      `,
      [
        id,
        JSON.stringify({
          previous_status: conversation.status,
          new_status,
          changed_by_ext_id,
          reason,
        }),
        toMysqlDateTime(now),
        toMysqlDateTime(now),
      ]
    );

    return getConversationDetail(tx, id);
  });

  emitConversationStatusChanged(result, {
    new_status,
    changed_by_ext_id,
    reason,
  });

  emitConversationUpdated(result);

  return result;
}

export async function closeExpiredConversations({ limit = 50 } = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number(limit || 50)));
  const now = new Date();

  const expiredConversations = await query(
    `
    SELECT *
    FROM conversations
    WHERE deleted_at IS NULL
      AND status = 'OPEN'
      AND inactivity_deadline_at IS NOT NULL
      AND inactivity_deadline_at <= ?
    ORDER BY inactivity_deadline_at ASC
    LIMIT ${safeLimit}
    `,
    [toMysqlDateTime(now)]
  );

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
    const updatedConversation = await transaction(async (tx) => {
      const freshRows = await tx.query(
        `
        SELECT *
        FROM conversations
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
        `,
        [conversation.id]
      );

      const freshConversation = freshRows[0];

      if (!freshConversation) {
        return null;
      }

      if (
        freshConversation.status !== 'OPEN' ||
        !freshConversation.inactivity_deadline_at ||
        toDate(freshConversation.inactivity_deadline_at).getTime() > now.getTime()
      ) {
        return null;
      }

      await tx.execute(
        `
        UPDATE conversations
        SET
          status = 'CLOSED_TIMEOUT',
          close_reason = 'TIMEOUT',
          closed_at = ?,
          is_live = false,
          inactivity_deadline_at = NULL,
          updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [toMysqlDateTime(now), toMysqlDateTime(now), freshConversation.id]
      );

      await tx.execute(
        `
        INSERT INTO status_history
          (
            id,
            conversation_id,
            previous_status,
            new_status,
            changed_by_role,
            changed_by_ext_id,
            reason,
            changed_at,
            created_at,
            updated_at
          )
        VALUES
          (
            UUID(),
            ?,
            ?,
            'CLOSED_TIMEOUT',
            'SYSTEM',
            NULL,
            'Cierre automático por inactividad.',
            ?,
            ?,
            ?
          )
        `,
        [
          freshConversation.id,
          freshConversation.status,
          toMysqlDateTime(now),
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );

      await tx.execute(
        `
        INSERT INTO messages
          (
            id,
            conversation_id,
            sender_role,
            sender_ext_id,
            message_type,
            content,
            sent_at,
            created_at,
            updated_at
          )
        VALUES
          (
            UUID(),
            ?,
            'SYSTEM',
            NULL,
            'AUTO_CLOSE',
            'El chat fue cerrado automáticamente por inactividad.',
            ?,
            ?,
            ?
          )
        `,
        [
          freshConversation.id,
          toMysqlDateTime(now),
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );

      const timeToCloseMs = Math.max(
        0,
        now.getTime() - toDate(freshConversation.opened_at).getTime()
      );

      await tx.execute(
        `
        INSERT INTO metrics
          (
            conversation_id,
            resolved_at,
            time_to_close_ms,
            created_at,
            updated_at
          )
        VALUES
          (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          resolved_at = VALUES(resolved_at),
          time_to_close_ms = VALUES(time_to_close_ms),
          deleted_at = NULL,
          updated_at = VALUES(updated_at)
        `,
        [
          freshConversation.id,
          toMysqlDateTime(now),
          timeToCloseMs,
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );

      await tx.execute(
        `
        INSERT INTO events
          (
            id,
            conversation_id,
            event_type,
            payload,
            created_at,
            updated_at
          )
        VALUES
          (
            UUID(),
            ?,
            'STATUS_CHANGED',
            CAST(? AS JSON),
            ?,
            ?
          )
        `,
        [
          freshConversation.id,
          JSON.stringify({
            previous_status: freshConversation.status,
            new_status: 'CLOSED_TIMEOUT',
            changed_by_ext_id: null,
            reason: 'Cierre automático por inactividad.',
            automatic: true,
          }),
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );

      await tx.execute(
        `
        INSERT INTO events
          (
            id,
            conversation_id,
            event_type,
            payload,
            created_at,
            updated_at
          )
        VALUES
          (
            UUID(),
            ?,
            'AUTO_TIMEOUT_CLOSED',
            CAST(? AS JSON),
            ?,
            ?
          )
        `,
        [
          freshConversation.id,
          JSON.stringify({
            inactivity_deadline_at: freshConversation.inactivity_deadline_at,
            closed_at: toMysqlDateTime(now),
          }),
          toMysqlDateTime(now),
          toMysqlDateTime(now),
        ]
      );

      return getConversationDetail(tx, freshConversation.id);
    });

    if (updatedConversation) {
      emitConversationStatusChanged(updatedConversation, {
        previous_status: 'OPEN',
        new_status: 'CLOSED_TIMEOUT',
        automatic: true,
        reason: 'Cierre automático por inactividad.',
      });

      emitConversationUpdated(updatedConversation);

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
    parsed.start_time = normalizeTimeString(payload.start_time);
  }

  if (!partial || payload.end_time !== undefined) {
    parsed.end_time = normalizeTimeString(payload.end_time);
  }

  if (parsed.start_time && parsed.end_time) {
    if (timeValueToMinutes(parsed.start_time) >= timeValueToMinutes(parsed.end_time)) {
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
    const timezone =
      normalizeOptionalString(payload.timezone) || 'America/Guatemala';
    parsed.timezone = timezone;
  }

  return parsed;
}

export async function createAvailability(payload = {}) {
  const data = validateAvailabilityPayload(payload);

  const exists = await query(
    `
    SELECT id
    FROM chat_availability
    WHERE day_of_week = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [data.day_of_week]
  );

  if (exists.length) {
    throw createAppError(
      'AVAILABILITY_ALREADY_EXISTS',
      `Ya existe un horario activo para el día ${data.day_of_week}.`,
      409
    );
  }

  await execute(
    `
    INSERT INTO chat_availability
      (
        id,
        day_of_week,
        start_time,
        end_time,
        enabled,
        timezone,
        active_day_of_week,
        created_at,
        updated_at
      )
    VALUES
      (
        UUID(),
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        NOW(),
        NOW()
      )
    `,
    [
      data.day_of_week,
      data.start_time,
      data.end_time,
      data.enabled,
      data.timezone,
      data.enabled ? data.day_of_week : null,
    ]
  );

  const rows = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE day_of_week = ?
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [data.day_of_week]
  );

  return serializeAvailability(rows[0]);
}

export async function listAvailability() {
  const items = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE deleted_at IS NULL
    ORDER BY day_of_week ASC
    `
  );

  return items.map(serializeAvailability);
}

export async function getAvailabilityById(availabilityId) {
  const id = normalizeOptionalString(availabilityId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'availabilityId es obligatorio.', 400);
  }

  const rows = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [id]
  );

  const item = rows[0];

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

  const currentRows = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [id]
  );

  const current = currentRows[0];

  if (!current) {
    throw createAppError(
      'AVAILABILITY_NOT_FOUND',
      'Horario no encontrado.',
      404
    );
  }

  const nextDayOfWeek =
    data.day_of_week !== undefined ? data.day_of_week : current.day_of_week;

  const duplicateRows = await query(
    `
    SELECT id
    FROM chat_availability
    WHERE day_of_week = ?
      AND deleted_at IS NULL
      AND id <> ?
    LIMIT 1
    `,
    [nextDayOfWeek, id]
  );

  if (duplicateRows.length) {
    throw createAppError(
      'AVAILABILITY_ALREADY_EXISTS',
      `Ya existe otro horario activo para el día ${nextDayOfWeek}.`,
      409
    );
  }

  const nextStartTime =
    data.start_time !== undefined ? data.start_time : current.start_time;

  const nextEndTime =
    data.end_time !== undefined ? data.end_time : current.end_time;

  if (timeValueToMinutes(nextStartTime) >= timeValueToMinutes(nextEndTime)) {
    throw createAppError(
      'VALIDATION_ERROR',
      'start_time debe ser menor que end_time.',
      400
    );
  }

  const enabled =
    data.enabled !== undefined ? data.enabled : Boolean(current.enabled);

  const timezone =
    data.timezone !== undefined ? data.timezone : current.timezone;

  await execute(
    `
    UPDATE chat_availability
    SET
      day_of_week = ?,
      start_time = ?,
      end_time = ?,
      enabled = ?,
      timezone = ?,
      active_day_of_week = ?,
      updated_at = NOW()
    WHERE id = ?
      AND deleted_at IS NULL
    `,
    [
      nextDayOfWeek,
      nextStartTime,
      nextEndTime,
      enabled,
      timezone,
      enabled ? nextDayOfWeek : null,
      id,
    ]
  );

  const rows = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [id]
  );

  return serializeAvailability(rows[0]);
}

export async function deleteAvailability(availabilityId) {
  const id = normalizeOptionalString(availabilityId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'availabilityId es obligatorio.', 400);
  }

  const currentRows = await query(
    `
    SELECT *
    FROM chat_availability
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [id]
  );

  const current = currentRows[0];

  if (!current) {
    throw createAppError(
      'AVAILABILITY_NOT_FOUND',
      'Horario no encontrado.',
      404
    );
  }

  await execute(
    `
    UPDATE chat_availability
    SET
      enabled = false,
      active_day_of_week = NULL,
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
      AND deleted_at IS NULL
    `,
    [id]
  );

  return serializeAvailability({
    ...current,
    enabled: false,
    active_day_of_week: null,
    deleted_at: new Date(),
    updated_at: new Date(),
  });
}