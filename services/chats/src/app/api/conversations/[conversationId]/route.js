import { successResponse, errorResponse } from '../../../../lib/api-response';
import { getConversationById } from '../../../../lib/conversation-service';

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

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const conversation = await getConversationById(resolvedParams.conversationId);

    return successResponse({
      data: conversation,
      message: 'Conversación obtenida correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}