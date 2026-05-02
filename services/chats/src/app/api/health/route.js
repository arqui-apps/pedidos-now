// src/app/api/health/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: 'chats-service',
      status: 'ok',
      message: 'Servicio de chats funcionando correctamente.',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}