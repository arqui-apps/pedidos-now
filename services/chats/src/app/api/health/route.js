import { prisma } from '../../../lib/prisma';
import { successResponse, errorResponse } from '../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 AS ok`;

    return successResponse({
      data: {
        service: 'chats-service',
        status: 'ok',
        database: Array.isArray(result) && result.length > 0 ? 'ok' : 'unknown',
        timestamp: new Date().toISOString(),
      },
      message: 'Servicio disponible.',
      status: 200,
    });
  } catch (error) {
    console.error('Health check error:', error);

    return errorResponse({
      code: 'SERVICE_UNAVAILABLE',
      message: 'El servicio está arriba, pero la base de datos no responde.',
      status: 503,
    });
  }
}