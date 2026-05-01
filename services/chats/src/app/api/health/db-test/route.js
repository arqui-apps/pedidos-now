import mysql from 'mysql2/promise';
import { successResponse, errorResponse } from '../../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let connection;

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return errorResponse({
        code: 'DATABASE_URL_MISSING',
        message: 'DATABASE_URL no está definida.',
        status: 500,
      });
    }

    connection = await mysql.createConnection(databaseUrl);

    const [rows] = await connection.query('SELECT 1 AS ok');

    return successResponse({
      data: {
        status: 'ok',
        database: 'connected',
        rows,
      },
      message: 'Conexión mysql2 funcionando correctamente.',
      status: 200,
    });
  } catch (error) {
    console.error('mysql2 db-test error:', error);

    return errorResponse({
      code: 'MYSQL2_CONNECTION_ERROR',
      message: error.message || 'mysql2 no pudo conectar.',
      status: 500,
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch {}
    }
  }
}