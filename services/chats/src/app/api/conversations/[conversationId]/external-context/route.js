// src/app/api/conversations/[conversationId]/external-context/route.js
import { NextResponse } from 'next/server';
import { getConversationById } from '../../../../../lib/conversation-service';
import {
  getBusinessById,
  getBusinessOrderByExternalCode,
  getBusinessOrderDeliveryByExternalCode,
  getPaqueteriaCourierById,
  getPaqueteriaPackageById,
  getPaqueteriaShipmentById,
} from '../../../../../lib/external-services';

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

async function getConversationId(params) {
  const resolvedParams = await params;
  const conversationId = resolvedParams?.conversationId;

  if (!conversationId || typeof conversationId !== 'string') {
    return null;
  }

  const trimmed = conversationId.trim();

  return trimmed.length ? trimmed : null;
}

async function safeExternalCall(source, fn) {
  try {
    const data = await fn();

    return {
      source,
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      source,
      success: false,
      data: null,
      error: {
        code: error.code || 'EXTERNAL_SERVICE_ERROR',
        message: error.message,
        details: error.details || null,
      },
    };
  }
}

export async function GET(request, { params }) {
  try {
    const conversationId = await getConversationId(params);

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'conversationId es obligatorio.',
        },
        { status: 400 }
      );
    }

    const conversation = await getConversationById(conversationId);

    const caseReference = conversation.case_reference;
    const caseType = conversation.case_type;
    const requesterType = conversation.requester_type;
    const requesterExtId = conversation.requester_ext_id;

    const externalContext = [];

    if (!caseReference) {
      return NextResponse.json(
        {
          success: true,
          message:
            'La conversación no tiene case_reference, por lo tanto no se consultó contexto externo.',
          data: {
            conversation: {
              id: conversation.id,
              requester_type: requesterType,
              requester_ext_id: requesterExtId,
              case_type: caseType,
              case_reference: caseReference,
              status: conversation.status,
            },
            external_context: [],
          },
        },
        { status: 200 }
      );
    }

    if (caseType === 'DELIVERY') {
      externalContext.push(
        await safeExternalCall('PAQUETERIA_SHIPMENT', () =>
          getPaqueteriaShipmentById(caseReference)
        )
      );

      externalContext.push(
        await safeExternalCall('PAQUETERIA_PACKAGE', () =>
          getPaqueteriaPackageById(caseReference)
        )
      );

      if (requesterType === 'COURIER') {
        externalContext.push(
          await safeExternalCall('PAQUETERIA_COURIER', () =>
            getPaqueteriaCourierById(requesterExtId)
          )
        );
      }
    }

    if (caseType === 'ORDER') {
      externalContext.push(
        await safeExternalCall('BUSINESS_ORDER', () =>
          getBusinessOrderByExternalCode(caseReference)
        )
      );

      externalContext.push(
        await safeExternalCall('BUSINESS_ORDER_DELIVERY', () =>
          getBusinessOrderDeliveryByExternalCode(caseReference)
        )
      );
    }

    if (caseType === 'BUSINESS_CASE') {
      externalContext.push(
        await safeExternalCall('BUSINESS', () => getBusinessById(caseReference))
      );
    }

    if (externalContext.length === 0) {
      externalContext.push({
        source: 'NONE',
        success: false,
        data: null,
        error: {
          code: 'NO_EXTERNAL_MAPPING',
          message:
            'No hay integración externa configurada para este tipo de caso.',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            requester_type: requesterType,
            requester_ext_id: requesterExtId,
            case_type: caseType,
            case_reference: caseReference,
            status: conversation.status,
          },
          external_context: externalContext,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get external context error:', error);
    return createErrorResponse(error);
  }
}