// src/lib/message-service.js
import { query, transaction } from './db';
import { emitMessageCreated } from './realtime';

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

function isConversationFinal(status) {
  return [
    'RESOLVED_NO_SOLUTION',
    'RESOLVED_COUPON',
    'RESOLVED_REFUND',
    'CLOSED_TIMEOUT',
    'CLOSED_MANUAL',
    'CLOSED_OUT_OF_HOURS',
  ].includes(status);
}

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function toMysqlDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);

  const pad = (number) => String(number).padStart(2, '0');

  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
  ].join('-') +
    ' ' +
    [
      pad(d.getHours()),
      pad(d.getMinutes()),
      pad(d.getSeconds()),
    ].join(':');
}

async function getConversationDetail(db, conversationId) {
  const conversations = await db.query(
    `
    SELECT *
    FROM conversations
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [conversationId]
  );

  if (!conversations.length) return null;

  const conversation = conversations[0];

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
    metrics: metricsRows[0] || null,
    participants,
    status_history: statusHistory,
  };
}

export async function listConversationMessages(conversationId, queryParams = {}) {
  const id = normalizeOptionalString(conversationId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'conversationId es obligatorio.', 400);
  }

  const page = Math.max(1, Number(queryParams.page || 1));
  const limit = Math.min(100, Math.max(1, Number(queryParams.limit || 20)));
  const skip = (page - 1) * limit;

  const conversationRows = await query(
    `
    SELECT id
    FROM conversations
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [id]
  );

  if (!conversationRows.length) {
    throw createAppError('CONVERSATION_NOT_FOUND', 'Conversación no encontrada.', 404);
  }

const items = await query(
  `
  SELECT
    id,
    conversation_id,
    sender_role,
    sender_ext_id,
    message_type,
    content,
    client_message_id,
    sent_at,
    deleted_at,
    created_at,
    updated_at
  FROM messages
  WHERE conversation_id = ?
    AND deleted_at IS NULL
  ORDER BY sent_at ASC
  LIMIT ${limit} OFFSET ${skip}
  `,
  [id]
);

  const totalRows = await query(
    `
    SELECT COUNT(*) AS total
    FROM messages
    WHERE conversation_id = ?
      AND deleted_at IS NULL
    `,
    [id]
  );

  const total = Number(totalRows?.[0]?.total || 0);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

export async function createConversationMessage(conversationId, payload = {}) {
  const id = normalizeOptionalString(conversationId);
  const sender_role = normalizeOptionalString(payload.sender_role);
  const sender_ext_id = normalizeOptionalString(payload.sender_ext_id);
  const content = normalizeOptionalString(payload.content);
  const client_message_id = normalizeOptionalString(payload.client_message_id);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'conversationId es obligatorio.', 400);
  }

  if (!['USER', 'AGENT'].includes(sender_role)) {
    throw createAppError(
      'VALIDATION_ERROR',
      'sender_role debe ser USER o AGENT.',
      400
    );
  }

  if (!sender_ext_id) {
    throw createAppError('VALIDATION_ERROR', 'sender_ext_id es obligatorio.', 400);
  }

  if (!content) {
    throw createAppError('VALIDATION_ERROR', 'content es obligatorio.', 400);
  }

  try {
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

      const metricsRows = await tx.query(
        `
        SELECT *
        FROM metrics
        WHERE conversation_id = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [id]
      );

      conversation.metrics = metricsRows[0] || null;

      if (isConversationFinal(conversation.status)) {
        throw createAppError(
          'CONVERSATION_CLOSED',
          'No se pueden enviar mensajes en una conversación finalizada.',
          409
        );
      }

      if (sender_role === 'USER') {
        if (conversation.requester_ext_id !== sender_ext_id) {
          throw createAppError(
            'SENDER_NOT_ALLOWED',
            'El usuario no corresponde al solicitante de la conversación.',
            403
          );
        }
      }

      if (sender_role === 'AGENT') {
        if (!conversation.assigned_agent_ext_id) {
          throw createAppError(
            'AGENT_NOT_ASSIGNED',
            'La conversación no tiene un agente asignado.',
            409
          );
        }

        if (conversation.assigned_agent_ext_id !== sender_ext_id) {
          throw createAppError(
            'SENDER_NOT_ALLOWED',
            'El agente no corresponde al agente asignado.',
            403
          );
        }
      }

      const messageRowsBefore = await tx.query(
        `
        SELECT UUID() AS id, NOW() AS sent_at
        `
      );

      const messageId = messageRowsBefore[0].id;
      const messageSentAt = toDate(messageRowsBefore[0].sent_at);
      const inactivityDeadline = new Date(
        messageSentAt.getTime() + Number(conversation.inactivity_minutes) * 60 * 1000
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
            client_message_id,
            sent_at,
            created_at,
            updated_at
          )
        VALUES
          (
            ?,
            ?,
            ?,
            ?,
            'TEXT',
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,
        [
          messageId,
          id,
          sender_role,
          sender_ext_id,
          content,
          sender_role === 'USER' ? client_message_id : null,
          toMysqlDateTime(messageSentAt),
          toMysqlDateTime(messageSentAt),
          toMysqlDateTime(messageSentAt),
        ]
      );

      const messageRows = await tx.query(
        `
        SELECT
          id,
          conversation_id,
          sender_role,
          sender_ext_id,
          message_type,
          content,
          client_message_id,
          sent_at,
          deleted_at,
          created_at,
          updated_at
        FROM messages
        WHERE id = ?
        LIMIT 1
        `,
        [messageId]
      );

      const message = messageRows[0];

      const updateParts = [
        'last_activity_at = ?',
        'inactivity_deadline_at = ?',
        'updated_at = ?',
      ];

      const updateParams = [
        toMysqlDateTime(messageSentAt),
        toMysqlDateTime(inactivityDeadline),
        toMysqlDateTime(messageSentAt),
      ];

      if (sender_role === 'USER') {
        updateParts.push('last_user_message_at = ?');
        updateParams.push(toMysqlDateTime(messageSentAt));
      }

      if (sender_role === 'AGENT') {
        updateParts.push('last_agent_message_at = ?');
        updateParams.push(toMysqlDateTime(messageSentAt));
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

      let responseMs = null;
      let shouldCountAgentResponse = false;

      if (
        sender_role === 'AGENT' &&
        conversation.last_user_message_at &&
        (!conversation.last_agent_message_at ||
          toDate(conversation.last_agent_message_at).getTime() <
            toDate(conversation.last_user_message_at).getTime())
      ) {
        responseMs = Math.max(
          0,
          messageSentAt.getTime() - toDate(conversation.last_user_message_at).getTime()
        );

        shouldCountAgentResponse = true;
      }

      const existingMetricsRows = await tx.query(
        `
        SELECT *
        FROM metrics
        WHERE conversation_id = ?
        LIMIT 1
        `,
        [id]
      );

      const existingMetrics = existingMetricsRows[0] || null;

      if (existingMetrics) {
        await tx.execute(
          `
          UPDATE metrics
          SET
            total_messages = total_messages + 1,
            total_user_messages = total_user_messages + ?,
            total_agent_messages = total_agent_messages + ?,
            first_agent_response_ms =
              CASE
                WHEN ? = 1 AND first_agent_response_ms IS NULL THEN ?
                ELSE first_agent_response_ms
              END,
            total_agent_response_ms = total_agent_response_ms + ?,
            agent_response_count = agent_response_count + ?,
            deleted_at = NULL,
            updated_at = ?
          WHERE conversation_id = ?
          `,
          [
            sender_role === 'USER' ? 1 : 0,
            sender_role === 'AGENT' ? 1 : 0,
            shouldCountAgentResponse ? 1 : 0,
            responseMs,
            shouldCountAgentResponse ? responseMs : 0,
            shouldCountAgentResponse ? 1 : 0,
            toMysqlDateTime(messageSentAt),
            id,
          ]
        );
      } else {
        await tx.execute(
          `
          INSERT INTO metrics
            (
              conversation_id,
              total_messages,
              total_user_messages,
              total_agent_messages,
              first_agent_response_ms,
              total_agent_response_ms,
              agent_response_count,
              created_at,
              updated_at
            )
          VALUES
            (
              ?,
              1,
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
            id,
            sender_role === 'USER' ? 1 : 0,
            sender_role === 'AGENT' ? 1 : 0,
            shouldCountAgentResponse ? responseMs : null,
            shouldCountAgentResponse ? responseMs : 0,
            shouldCountAgentResponse ? 1 : 0,
            toMysqlDateTime(messageSentAt),
            toMysqlDateTime(messageSentAt),
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
            'MESSAGE_CREATED',
            CAST(? AS JSON),
            ?,
            ?
          )
        `,
        [
          id,
          JSON.stringify({
            message_id: message.id,
            sender_role,
            sender_ext_id,
            message_type: message.message_type,
          }),
          toMysqlDateTime(messageSentAt),
          toMysqlDateTime(messageSentAt),
        ]
      );

      const updatedConversation = await getConversationDetail(tx, id);

      return {
        message,
        conversation: updatedConversation,
      };
    });

    emitMessageCreated({
      conversation: result.conversation,
      message: result.message,
    });

    return result.message;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw createAppError(
        'DUPLICATE_CLIENT_MESSAGE',
        'El client_message_id ya fue usado en esta conversación.',
        409
      );
    }

    throw error;
  }
}