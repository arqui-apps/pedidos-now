// src/app/api/availability/route.js
import { NextResponse } from 'next/server';
import { execute, query } from '../../../lib/db';

export async function GET() {
  try {
    const rows = await query(`
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
      WHERE deleted_at IS NULL
      ORDER BY day_of_week ASC, start_time ASC
    `);

    return NextResponse.json(
      {
        success: true,
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET availability error:', error);

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

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      day_of_week,
      start_time,
      end_time,
      enabled = true,
      timezone = 'America/Guatemala',
    } = body;

    if (
      day_of_week === undefined ||
      start_time === undefined ||
      end_time === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'day_of_week, start_time y end_time son obligatorios.',
        },
        { status: 400 }
      );
    }

    const parsedDay = Number(day_of_week);

    if (Number.isNaN(parsedDay) || parsedDay < 0 || parsedDay > 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'day_of_week debe estar entre 0 y 6. 0 = domingo, 6 = sábado.',
        },
        { status: 400 }
      );
    }

    const activeDayOfWeek = enabled ? parsedDay : null;

    await execute(
      `
      INSERT INTO chat_availability
        (
          id,
          day_of_week,
          start_time,
          end_time,
          enabled,
          timezone,
          active_day_of_week,
          created_at,
          updated_at
        )
      VALUES
        (
          UUID(),
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NOW(),
          NOW()
        )
      `,
      [
        parsedDay,
        start_time,
        end_time,
        Boolean(enabled),
        timezone,
        activeDayOfWeek,
      ]
    );

    const createdRows = await query(
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
      WHERE day_of_week = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [parsedDay]
    );

    return NextResponse.json(
      {
        success: true,
        data: createdRows[0],
        message: 'Horario de atención creado correctamente.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST availability error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message:
            'Ya existe un horario activo para ese día. Puedes actualizarlo o desactivar el horario anterior.',
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