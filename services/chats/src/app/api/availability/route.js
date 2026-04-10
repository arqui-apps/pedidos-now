import { successResponse, errorResponse } from '../../../lib/api-response';
import {
  createAvailability,
  listAvailability,
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

export async function GET() {
  try {
    const data = await listAvailability();

    return successResponse({
      data,
      message: 'Horarios obtenidos correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await createAvailability(body);

    return successResponse({
      data,
      message: 'Horario creado correctamente.',
      status: 201,
    });
  } catch (error) {
    return handleError(error);
  }
}