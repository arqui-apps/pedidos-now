import { successResponse, errorResponse } from '../../../lib/api-response';
import {
  createConversation,
  listConversations,
} from '../../../lib/conversation-service';

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
    const body = await request.json();
    const conversation = await createConversation(body);

    return successResponse({
      data: conversation,
      message: 'Conversación creada correctamente.',
      status: 201,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await listConversations({
      status: searchParams.get('status'),
      requester_type: searchParams.get('requester_type'),
      assigned_agent_ext_id: searchParams.get('assigned_agent_ext_id'),
      case_type: searchParams.get('case_type'),
      from_date: searchParams.get('from_date'),
      to_date: searchParams.get('to_date'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    return successResponse({
      data: result,
      message: 'Conversaciones obtenidas correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}