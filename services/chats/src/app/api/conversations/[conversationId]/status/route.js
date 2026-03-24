import { successResponse, errorResponse } from '../../../../../lib/api-response';
import { changeConversationStatus } from '../../../../../lib/conversation-service';

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

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const result = await changeConversationStatus(
      resolvedParams.conversationId,
      body
    );

    return successResponse({
      data: result,
      message: 'Estado actualizado correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}