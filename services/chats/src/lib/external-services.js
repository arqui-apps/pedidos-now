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
  const result = await requestJson({
    serviceName: 'Descuentos',
    baseUrl: process.env.DISCOUNTS_SERVICE_URL,
    path: '/api/cupones',
    method: 'POST',
    body: payload,
  });

  return getData(result);
}