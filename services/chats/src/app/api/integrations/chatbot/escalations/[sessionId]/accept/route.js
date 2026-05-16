// src/app/api/integrations/chatbot/escalations/[sessionId]/accept/route.js
import { NextResponse } from 'next/server';
import {
  createConversation,
  assignAgentToConversation,
} from '../../../../../../../lib/conversation-service';
import {
  getChatbotEscalationBySession,
  updateChatbotEscalationStatus,
} from '../../../../../../../lib/external-services';

function createErrorResponse(error) {
  return NextResponse.json(
    {
      success: false,
      error: error.code || 'Internal Server Error',
      message: error.message,
      details: error.details || null,
    },
    { status: error.status || 500 }
  );
}

async function getSessionId(params) {
  const resolvedParams = await params;
  const sessionId = resolvedParams?.sessionId;

  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }

  const trimmed = sessionId.trim();

  return trimmed.length ? trimmed : null;
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function mapRequesterType(userType) {
  const normalized = String(userType || '').trim().toLowerCase();

  if (['cliente', 'customer', 'user', 'usuario'].includes(normalized)) {
    return 'CUSTOMER';
  }

  if (['repartidor', 'courier', 'driver'].includes(normalized)) {
    return 'COURIER';
  }

  if (['negocio', 'business', 'empresa', 'restaurante'].includes(normalized)) {
    return 'BUSINESS';
  }

  return 'CUSTOMER';
}

function inferCaseType(escalation = {}) {
  const problemCategory = String(escalation.problem_category || '').toLowerCase();
  const previousState = String(escalation.previous_state || '').toLowerCase();
  const contextData = escalation.context_data || {};

  if (
    problemCategory.includes('delivery') ||
    problemCategory.includes('entrega') ||
    problemCategory.includes('repartidor') ||
    previousState.includes('repartidor') ||
    contextData.delivery_id ||
    contextData.shipment_id
  ) {
    return 'DELIVERY';
  }

  if (
    problemCategory.includes('negocio') ||
    problemCategory.includes('business') ||
    previousState.includes('negocio') ||
    contextData.business_id
  ) {
    return 'BUSINESS_CASE';
  }

  if (
    problemCategory.includes('pedido') ||
    problemCategory.includes('order') ||
    contextData.order_code ||
    contextData.order_id
  ) {
    return 'ORDER';
  }

  return 'OTHER';
}

function inferCaseReference(escalation = {}, sessionId) {
  const contextData = escalation.context_data || {};

  return (
    normalizeOptionalString(contextData.order_code) ||
    normalizeOptionalString(contextData.order_id) ||
    normalizeOptionalString(contextData.delivery_id) ||
    normalizeOptionalString(contextData.shipment_id) ||
    normalizeOptionalString(contextData.package_id) ||
    normalizeOptionalString(contextData.business_id) ||
    normalizeOptionalString(String(escalation.id_escalation || '')) ||
    `chatbot-session-${sessionId}`
  );
}

function inferRequesterExtId(escalation = {}, sessionId) {
  return (
    normalizeOptionalString(String(escalation.id_usuario || '')) ||
    normalizeOptionalString(String(escalation.user_id || '')) ||
    normalizeOptionalString(String(escalation.id_user || '')) ||
    normalizeOptionalString(String(escalation.context_data?.id_usuario || '')) ||
    `chatbot-user-session-${sessionId}`
  );
}

function buildSubject(escalation = {}) {
  const summary = normalizeOptionalString(escalation.summary);
  const category = normalizeOptionalString(escalation.problem_category);

  if (summary && category) {
    return `Escalado desde bot (${category}): ${summary}`.slice(0, 255);
  }

  if (summary) {
    return `Escalado desde bot: ${summary}`.slice(0, 255);
  }

  if (category) {
    return `Escalado desde bot: ${category}`.slice(0, 255);
  }

  return 'Escalado desde servicio al cliente automatizado';
}

export async function POST(request, { params }) {
  try {
    const sessionId = await getSessionId(params);

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'sessionId es obligatorio.',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const agentExtId = normalizeOptionalString(body.agent_ext_id);
    const agentDisplayName = normalizeOptionalString(body.agent_display_name);

    const escalation = await getChatbotEscalationBySession(sessionId);

    if (!escalation) {
      return NextResponse.json(
        {
          success: false,
          error: 'ESCALATION_NOT_FOUND',
          message: 'No se encontró una escalación para la sesión indicada.',
        },
        { status: 404 }
      );
    }

    const requesterType = mapRequesterType(
      escalation.user_type || escalation.context_data?.user_type
    );

    const requesterExtId = inferRequesterExtId(escalation, sessionId);
    const caseType = inferCaseType(escalation);
    const caseReference = inferCaseReference(escalation, sessionId);
    const subject = buildSubject(escalation);

    let conversation = await createConversation({
      requester_type: requesterType,
      requester_ext_id: requesterExtId,
      requester_display_name:
        normalizeOptionalString(escalation.user_name) ||
        normalizeOptionalString(escalation.display_name) ||
        `Usuario chatbot ${requesterExtId}`,
      case_type: caseType,
      case_reference: caseReference,
      subject,
      inactivity_minutes: Number(body.inactivity_minutes || 5),
    });

    let assigned = false;

    if (agentExtId && conversation.status === 'IN_QUEUE') {
      conversation = await assignAgentToConversation(conversation.id, {
        agent_ext_id: agentExtId,
        agent_display_name: agentDisplayName || agentExtId,
      });

      assigned = true;
    }

    const escalationId = escalation.id_escalation || escalation.id || null;
    let handoffUpdate = null;
    let handoffStatus = assigned ? 'en_atencion' : 'recibido';

    if (escalationId) {
      try {
        handoffUpdate = await updateChatbotEscalationStatus(
          escalationId,
          handoffStatus
        );
      } catch (error) {
        handoffUpdate = {
          success: false,
          warning:
            'La conversación fue creada, pero no se pudo actualizar el estado de la escalación en el chatbot.',
          error: error.message,
        };
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Escalación aceptada y conversación creada correctamente.',
        data: {
          session_id: sessionId,
          escalation_id: escalationId,
          handoff_status_requested: escalationId ? handoffStatus : null,
          handoff_update: handoffUpdate,
          assigned,
          conversation,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Accept chatbot escalation error:', error);
    return createErrorResponse(error);
  }
}