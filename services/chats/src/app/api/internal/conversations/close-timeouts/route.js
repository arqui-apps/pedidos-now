import { successResponse, errorResponse } from '../../../../../lib/api-response';
import { closeExpiredConversations } from '../../../../../lib/conversation-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function handleError(error) {
  console.error(error);

  return errorResponse({
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Error interno del servidor.',
    status: error.status || 500,
  });
}

export async function POST(request) {
  try {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const result = await closeExpiredConversations({
      limit: body.limit,
    });

    return successResponse({
      data: result,
      message: 'Cierre por inactividad ejecutado correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}