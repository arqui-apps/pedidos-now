import { NextResponse } from 'next/server';

function serializeForJson(data) {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export function successResponse({ data = null, message = null, status = 200 } = {}) {
  const body = {
    success: true,
    data: serializeForJson(data),
  };

  if (message) {
    body.message = message;
  }

  return NextResponse.json(body, { status });
}

export function errorResponse({
  code = 'INTERNAL_ERROR',
  message = 'Error interno del servidor.',
  status = 500,
  details = null,
} = {}) {
  const body = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    body.error.details = serializeForJson(details);
  }

  return NextResponse.json(body, { status });
}