// src/app/api/availability/[availabilityId]/route.js
import { NextResponse } from 'next/server';
import { execute, query } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { availabilityId } = params;

    const rows = await query(
      `
      SELECT
        id,
        day_of_week,
        start_time,
        end_time,
        enabled,
        timezone,
        deleted_at,
        created_at,
        updated_at,
        active_day_of_week
      FROM chat_availability
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [availabilityId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Horario de atención no encontrado.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET availability by id error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { availabilityId } = params;
    const body = await request.json();

    const currentRows = await query(
      `
      SELECT
        id,
        day_of_week,
        start_time,
        end_time,
        enabled,
        timezone,
        active_day_of_week
      FROM chat_availability
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [availabilityId]
    );

    if (currentRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Horario de atención no encontrado.',
        },
        { status: 404 }
      );
    }

    const current = currentRows[0];

    const dayOfWeek =
      body.day_of_week !== undefined
        ? Number(body.day_of_week)
        : Number(current.day_of_week);

    const startTime =
      body.start_time !== undefined
        ? body.start_time
        : current.start_time;

    const endTime =
      body.end_time !== undefined
        ? body.end_time
        : current.end_time;

    const enabled =
      body.enabled !== undefined
        ? Boolean(body.enabled)
        : Boolean(current.enabled);

    const timezone =
      body.timezone !== undefined
        ? body.timezone
        : current.timezone;

    if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'day_of_week debe estar entre 0 y 6. 0 = domingo, 6 = sábado.',
        },
        { status: 400 }
      );
    }

    const activeDayOfWeek = enabled ? dayOfWeek : null;

    await execute(
      `
      UPDATE chat_availability
      SET
        day_of_week = ?,
        start_time = ?,
        end_time = ?,
        enabled = ?,
        timezone = ?,
        active_day_of_week = ?,
        updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [
        dayOfWeek,
        startTime,
        endTime,
        enabled,
        timezone,
        activeDayOfWeek,
        availabilityId,
      ]
    );

    const updatedRows = await query(
      `
      SELECT
        id,
        day_of_week,
        start_time,
        end_time,
        enabled,
        timezone,
        deleted_at,
        created_at,
        updated_at,
        active_day_of_week
      FROM chat_availability
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [availabilityId]
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedRows[0],
        message: 'Horario de atención actualizado correctamente.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH availability error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message:
            'Ya existe otro horario activo para ese día. Desactiva el otro horario o usa otro día.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { availabilityId } = params;

    const currentRows = await query(
      `
      SELECT id
      FROM chat_availability
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [availabilityId]
    );

    if (currentRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Horario de atención no encontrado.',
        },
        { status: 404 }
      );
    }

    await execute(
      `
      UPDATE chat_availability
      SET
        deleted_at = NOW(),
        active_day_of_week = NULL,
        updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [availabilityId]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Horario de atención eliminado correctamente.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE availability error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}