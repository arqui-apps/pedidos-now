// src/app/api/health/db-test/route.js
import { NextResponse } from 'next/server';
import { pingDb, query } from '../../../../lib/db';

export async function GET() {
  try {
    const isConnected = await pingDb();

    const dbInfo = await query(`
      SELECT 
        DATABASE() AS database_name,
        NOW() AS server_time
    `);

    return NextResponse.json(
      {
        success: true,
        service: 'chats-service',
        database: {
          connected: isConnected,
          name: dbInfo?.[0]?.database_name || null,
          server_time: dbInfo?.[0]?.server_time || null,
        },
        message: 'Conexión a MySQL funcionando correctamente.',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DB health error:', error);

    return NextResponse.json(
      {
        success: false,
        service: 'chats-service',
        database: {
          connected: false,
        },
        error: 'Database connection error',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}