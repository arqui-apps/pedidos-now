import { prisma } from '../../../lib/prisma';
import { successResponse, errorResponse } from '../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return successResponse({
      data: {
        status: 'ok',
        database: 'connected',
      },
      message: 'Servicio y base de datos operando correctamente.',
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