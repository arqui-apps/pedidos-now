import { successResponse, errorResponse } from '../../../../../lib/api-response';
import {
  listConversationMessages,
  createConversationMessage,
} from '../../../../../lib/message-service';

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
    const { searchParams } = new URL(request.url);

    const result = await listConversationMessages(resolvedParams.conversationId, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    return successResponse({
      data: result,
      message: 'Mensajes obtenidos correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const result = await createConversationMessage(
      resolvedParams.conversationId,
      body
    );

    return successResponse({
      data: result,
      message: 'Mensaje creado correctamente.',
      status: 201,
    });
  } catch (error) {
    return handleError(error);
  }
}