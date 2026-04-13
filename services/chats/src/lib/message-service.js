import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
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

export async function listConversationMessages(conversationId, query = {}) {
  const id = normalizeOptionalString(conversationId);

  if (!id) {
    throw createAppError('VALIDATION_ERROR', 'conversationId es obligatorio.', 400);
  }

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  const skip = (page - 1) * limit;

  const conversation = await prisma.conversations.findFirst({
    where: { id, deleted_at: null },
  });

  if (!conversation) {
    throw createAppError('CONVERSATION_NOT_FOUND', 'Conversación no encontrada.', 404);
  }

  const [items, total] = await prisma.$transaction([
    prisma.messages.findMany({
      where: {
        conversation_id: id,
        deleted_at: null,
      },
      orderBy: { sent_at: 'asc' },
      skip,
      take: limit,
    }),
    prisma.messages.count({
      where: {
        conversation_id: id,
        deleted_at: null,
      },
    }),
  ]);

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
    const result = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversations.findFirst({
        where: { id, deleted_at: null },
        include: {
          metrics: true,
          participants: {
            where: { deleted_at: null },
          },
        },
      });

      if (!conversation) {
        throw createAppError('CONVERSATION_NOT_FOUND', 'Conversación no encontrada.', 404);
      }

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

      const message = await tx.messages.create({
        data: {
          conversation_id: id,
          sender_role,
          sender_ext_id,
          message_type: 'TEXT',
          content,
          client_message_id: sender_role === 'USER' ? client_message_id : null,
        },
      });

      if (
        sender_role === 'AGENT' &&
        conversation.last_user_message_at &&
        (!conversation.metrics || conversation.metrics.first_agent_response_ms == null)
      ) {
        const firstAgentResponseMs = Math.max(
          0,
          new Date(message.sent_at).getTime() -
            new Date(conversation.last_user_message_at).getTime()
        );

        await tx.metrics.upsert({
          where: { conversation_id: id },
          update: {
            first_agent_response_ms: firstAgentResponseMs,
            total_agent_response_ms: {
              increment: firstAgentResponseMs,
            },
            agent_response_count: {
              increment: 1,
            },
            deleted_at: null,
          },
          create: {
            conversation_id: id,
            first_agent_response_ms: firstAgentResponseMs,
            total_agent_response_ms: firstAgentResponseMs,
            agent_response_count: 1,
          },
        });
      }

      await tx.events.create({
        data: {
          conversation_id: id,
          event_type: 'MESSAGE_CREATED',
          payload: {
            message_id: message.id,
            sender_role,
            sender_ext_id,
            message_type: message.message_type,
          },
        },
      });

      const updatedConversation = await tx.conversations.findFirst({
        where: { id, deleted_at: null },
        include: {
          metrics: true,
          participants: {
            where: { deleted_at: null },
            orderBy: { joined_at: 'asc' },
          },
          status_history: {
            where: { deleted_at: null },
            orderBy: { changed_at: 'asc' },
          },
        },
      });

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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw createAppError(
        'DUPLICATE_CLIENT_MESSAGE',
        'El client_message_id ya fue usado en esta conversación.',
        409
      );
    }

    throw error;
  }
}