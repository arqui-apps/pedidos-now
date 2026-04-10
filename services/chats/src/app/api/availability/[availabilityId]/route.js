import { successResponse, errorResponse } from '../../../../lib/api-response';
import {
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
} from '../../../../lib/conversation-service';

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

async function resolveAvailabilityId(context) {
  const params = await context.params;
  return params?.availabilityId || null;
}

export async function GET(_request, context) {
  try {
    const availabilityId = await resolveAvailabilityId(context);
    const data = await getAvailabilityById(availabilityId);

    return successResponse({
      data,
      message: 'Horario obtenido correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request, context) {
  try {
    const availabilityId = await resolveAvailabilityId(context);
    const body = await request.json();
    const data = await updateAvailability(availabilityId, body);

    return successResponse({
      data,
      message: 'Horario actualizado correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request, context) {
  try {
    const availabilityId = await resolveAvailabilityId(context);
    const data = await deleteAvailability(availabilityId);

    return successResponse({
      data,
      message: 'Horario deshabilitado correctamente.',
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}