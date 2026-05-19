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
  getRestaurantById,
  getRestaurantOrderLogistics,
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

function parseRestaurantReference(caseReference) {
  if (!caseReference || typeof caseReference !== 'string') {
    return {
      restauranteId: null,
      pedidoId: null,
    };
  }

  const trimmed = caseReference.trim();

  // Formato recomendado:
  // "1:25" => restauranteId=1, pedidoId=25
  if (trimmed.includes(':')) {
    const [restauranteId, pedidoId] = trimmed.split(':').map((part) => part.trim());

    return {
      restauranteId: restauranteId || null,
      pedidoId: pedidoId || null,
    };
  }

  // Formato alternativo JSON:
  // {"restaurante_id":"1","pedido_id":"25"}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);

      return {
        restauranteId:
          parsed.restaurante_id ||
          parsed.restauranteId ||
          parsed.restaurant_id ||
          parsed.restaurantId ||
          null,
        pedidoId:
          parsed.pedido_id ||
          parsed.pedidoId ||
          parsed.order_id ||
          parsed.orderId ||
          null,
      };
    } catch {
      return {
        restauranteId: null,
        pedidoId: null,
      };
    }
  }

  return {
    restauranteId: null,
    pedidoId: null,
  };
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
      // Negocios / supermercados / farmacias
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

      // Restaurantes
      const { restauranteId, pedidoId } =
        parseRestaurantReference(caseReference);

      if (restauranteId && pedidoId) {
        externalContext.push(
          await safeExternalCall('RESTAURANTE', () =>
            getRestaurantById(restauranteId)
          )
        );

        externalContext.push(
          await safeExternalCall('RESTAURANTE_ORDER_LOGISTICS', () =>
            getRestaurantOrderLogistics(restauranteId, pedidoId)
          )
        );
      } else {
        externalContext.push({
          source: 'RESTAURANTE_ORDER_LOGISTICS',
          success: false,
          data: null,
          error: {
            code: 'INVALID_RESTAURANT_REFERENCE',
            message:
              'Para consultar Restaurantes, case_reference debe tener formato restaurante_id:pedido_id. Ejemplo: 1:25.',
          },
        });
      }
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