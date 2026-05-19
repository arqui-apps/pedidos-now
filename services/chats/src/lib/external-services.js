// src/lib/external-services.js

function createAppError(code, message, status = 400, details = null) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.details = details;
  return error;
}

function normalizeBaseUrl(value) {
  if (!value || typeof value !== 'string') return null;
  return value.trim().replace(/\/+$/, '');
}

function buildUrl(baseUrl, path) {
  const cleanBase = normalizeBaseUrl(baseUrl);

  if (!cleanBase) {
    throw createAppError(
      'EXTERNAL_SERVICE_URL_MISSING',
      `No está configurada la URL base para el servicio externo.`,
      500
    );
  }

  const cleanPath = String(path || '').startsWith('/')
    ? String(path)
    : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

async function requestJson({
  serviceName,
  baseUrl,
  path,
  method = 'GET',
  body,
  headers = {},
  timeoutMs = 12000,
}) {
  const url = buildUrl(baseUrl, path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const rawText = await response.text();

    let json = null;

    if (rawText) {
      try {
        json = JSON.parse(rawText);
      } catch {
        json = {
          raw: rawText,
        };
      }
    }

    if (!response.ok) {
      throw createAppError(
        'EXTERNAL_SERVICE_ERROR',
        `${serviceName} respondió con error ${response.status}.`,
        response.status,
        {
          url,
          status: response.status,
          response: json,
        }
      );
    }

    return json;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createAppError(
        'EXTERNAL_SERVICE_TIMEOUT',
        `${serviceName} tardó demasiado en responder.`,
        504,
        { url }
      );
    }

    if (error.code) {
      throw error;
    }

    throw createAppError(
      'EXTERNAL_SERVICE_UNAVAILABLE',
      `No se pudo conectar con ${serviceName}.`,
      503,
      {
        url,
        message: error.message,
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}

function getData(payload) {
  if (!payload) return null;
  return payload.data || payload;
}

// ===============================
// CHATBOT / SERVICIO AUTOMATIZADO
// ===============================

export async function getChatbotEscalationBySession(sessionId) {
  if (!sessionId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'sessionId es obligatorio para consultar escalación.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Chatbot',
    baseUrl: process.env.CHATBOT_SERVICE_URL,
    path: `/escalation/session/${encodeURIComponent(sessionId)}`,
  });

  return getData(result);
}

export async function getChatbotEscalationById(escalationId) {
  if (!escalationId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'escalationId es obligatorio.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Chatbot',
    baseUrl: process.env.CHATBOT_SERVICE_URL,
    path: `/escalation/${encodeURIComponent(escalationId)}`,
  });

  return getData(result);
}

export async function updateChatbotEscalationStatus(escalationId, handoffStatus) {
  if (!escalationId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'escalationId es obligatorio para actualizar handoff.',
      400
    );
  }

  if (!handoffStatus) {
    throw createAppError(
      'VALIDATION_ERROR',
      'handoffStatus es obligatorio.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Chatbot',
    baseUrl: process.env.CHATBOT_SERVICE_URL,
    path: `/escalation/${encodeURIComponent(escalationId)}/status`,
    method: 'PATCH',
    body: {
      handoff_status: handoffStatus,
    },
  });

  return getData(result);
}

// ===============================
// PAQUETERÍA
// ===============================

export async function getPaqueteriaUserById(userId) {
  const result = await requestJson({
    serviceName: 'Paquetería',
    baseUrl: process.env.PAQUETERIA_SERVICE_URL,
    path: `/api/users/${encodeURIComponent(userId)}`,
  });

  return getData(result);
}

export async function getPaqueteriaCourierById(courierId) {
  const result = await requestJson({
    serviceName: 'Paquetería',
    baseUrl: process.env.PAQUETERIA_SERVICE_URL,
    path: `/api/couriers/${encodeURIComponent(courierId)}`,
  });

  return getData(result);
}

export async function getPaqueteriaShipmentById(shipmentId) {
  const result = await requestJson({
    serviceName: 'Paquetería',
    baseUrl: process.env.PAQUETERIA_SERVICE_URL,
    path: `/api/shipments/${encodeURIComponent(shipmentId)}`,
  });

  return getData(result);
}

export async function getPaqueteriaPackageById(packageId) {
  const result = await requestJson({
    serviceName: 'Paquetería',
    baseUrl: process.env.PAQUETERIA_SERVICE_URL,
    path: `/api/packages/${encodeURIComponent(packageId)}`,
  });

  return getData(result);
}

// ===============================
// NEGOCIOS / BUSINESS
// ===============================

export async function getBusinessById(businessId) {
  const result = await requestJson({
    serviceName: 'Negocios',
    baseUrl: process.env.BUSINESS_SERVICE_URL,
    path: `/businesses/${encodeURIComponent(businessId)}`,
  });

  return getData(result);
}

export async function getBusinessOrderByExternalCode(externalOrderCode) {
  const result = await requestJson({
    serviceName: 'Negocios',
    baseUrl: process.env.BUSINESS_SERVICE_URL,
    path: `/internal/business-orders/${encodeURIComponent(externalOrderCode)}`,
  });

  return getData(result);
}

export async function getBusinessOrderDeliveryByExternalCode(externalOrderCode) {
  const result = await requestJson({
    serviceName: 'Negocios',
    baseUrl: process.env.BUSINESS_SERVICE_URL,
    path: `/internal/business-orders/${encodeURIComponent(externalOrderCode)}/delivery`,
  });

  return getData(result);
}

// ===============================
// DESCUENTOS / PROMOCIONES
// ===============================
// Nota: esta función queda preparada.
// Antes de conectarla al cierre RESOLVED_COUPON, conviene confirmar
// el body exacto que espera el servicio de descuentos.

export async function createCompensationCoupon(payload = {}) {
  const clienteId = Number(payload.cliente_id);

  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    throw createAppError(
      'VALIDATION_ERROR',
      'cliente_id debe ser un número entero positivo para crear cupón de compensación.',
      400
    );
  }

  const valorDescuento = Number(payload.valor_descuento || 20);

  if (!Number.isFinite(valorDescuento) || valorDescuento <= 0) {
    throw createAppError(
      'VALIDATION_ERROR',
      'valor_descuento debe ser un número mayor a 0.',
      400
    );
  }

  const pedidoAfectadoId = Number(payload.pedido_afectado_id);

  if (!Number.isInteger(pedidoAfectadoId) || pedidoAfectadoId <= 0) {
    throw createAppError(
      'VALIDATION_ERROR',
      'pedido_afectado_id debe ser un número entero positivo para crear cupón de compensación.',
      400
    );
  }

  const body = {
    tipo: 'COMPENSACION',
    cliente_id: clienteId,
    tipo_descuento: payload.tipo_descuento || 'MONTO_FIJO',
    valor_descuento: valorDescuento,
    monto_minimo_pedido:
      payload.monto_minimo_pedido === undefined
        ? null
        : payload.monto_minimo_pedido,
    origen_solicitud: payload.origen_solicitud || 'CHAT_AGENTE',
    solicitado_por: payload.solicitado_por || 'chat_servicio_cliente',
    pedido_afectado_id: pedidoAfectadoId,
    motivo_compensacion:
      payload.motivo_compensacion ||
      'Compensación generada desde chat de servicio al cliente.',
    confirmacion_pedido_fallido:
      payload.confirmacion_pedido_fallido === undefined
        ? true
        : Boolean(payload.confirmacion_pedido_fallido),
  };

  const result = await requestJson({
    serviceName: 'Descuentos',
    baseUrl: process.env.DISCOUNTS_SERVICE_URL,
    path: '/api/cupones',
    method: 'POST',
    body,
  });

  return getData(result);
}
// ===============================
// COBROS / PAYMENTS
// ===============================

export async function getPaymentsByOrderId(orderId) {
  if (!orderId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'orderId es obligatorio para consultar cobros.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Cobros',
    baseUrl: process.env.COBROS_SERVICE_URL,
    path: `/api/payments?orderId=${encodeURIComponent(orderId)}`,
  });

  return getData(result);
}

export async function getPaymentById(paymentId) {
  if (!paymentId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'paymentId es obligatorio para consultar cobro.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Cobros',
    baseUrl: process.env.COBROS_SERVICE_URL,
    path: `/api/payments/${encodeURIComponent(paymentId)}`,
  });

  return getData(result);
}

export async function refundPayment(paymentId, payload = {}) {
  if (!paymentId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'paymentId es obligatorio para solicitar reembolso.',
      400
    );
  }

  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createAppError(
      'VALIDATION_ERROR',
      'amount debe ser un número mayor a 0 para solicitar reembolso.',
      400
    );
  }

  const body = {
    amount,
    reason:
      payload.reason ||
      'Reembolso aprobado desde chat de servicio al cliente.',
  };

  const result = await requestJson({
    serviceName: 'Cobros',
    baseUrl: process.env.COBROS_SERVICE_URL,
    path: `/api/payments/${encodeURIComponent(paymentId)}/refund`,
    method: 'POST',
    body,
  });

  return getData(result);
}
// ===============================
// RESTAURANTES
// ===============================

export async function getRestaurantById(restauranteId) {
  if (!restauranteId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'restauranteId es obligatorio para consultar restaurante.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Restaurantes',
    baseUrl: process.env.RESTAURANTES_SERVICE_URL,
    path: `/restaurantes/${encodeURIComponent(restauranteId)}`,
  });

  return getData(result);
}

export async function getRestaurantOrderLogistics(restauranteId, pedidoId) {
  if (!restauranteId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'restauranteId es obligatorio para consultar pedido de restaurante.',
      400
    );
  }

  if (!pedidoId) {
    throw createAppError(
      'VALIDATION_ERROR',
      'pedidoId es obligatorio para consultar pedido de restaurante.',
      400
    );
  }

  const result = await requestJson({
    serviceName: 'Restaurantes',
    baseUrl: process.env.RESTAURANTES_SERVICE_URL,
    path: `/restaurantes/${encodeURIComponent(
      restauranteId
    )}/pedidos/${encodeURIComponent(pedidoId)}/logistica`,
  });

  return getData(result);
}