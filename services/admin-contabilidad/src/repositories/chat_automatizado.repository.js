const db = require('../config/db');

const query = (conn) => conn || db;

const toJson = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'string') {
        try {
            JSON.parse(value);
            return value;
        } catch (error) {
            return JSON.stringify(value);
        }
    }

    return JSON.stringify(value);
};

const toNumber = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    return Number(value);
};

const mapResumenRow = (row) => ({
    total_sesiones: toNumber(row.total_sesiones) ?? 0,
    sesiones_activas: toNumber(row.sesiones_activas) ?? 0,
    resueltas: toNumber(row.resueltas) ?? 0,
    escaladas: toNumber(row.escaladas) ?? 0,
    minutos_promedio: toNumber(row.minutos_promedio)
});

const mapCompensacionResumen = (row) => ({
    compensation_type: row.compensation_type,
    compensation_status: row.compensation_status,
    total: toNumber(row.total) ?? 0,
    monto_total: toNumber(row.monto_total) ?? 0
});

const mapCountRow = (row, key) => ({
    [key]: row[key],
    total: toNumber(row.total) ?? 0
});

const mapReporteClienteRow = (row) => ({
    ...row,
    minutos_resolucion: toNumber(row.minutos_resolucion),
    total_mensajes: toNumber(row.total_mensajes) ?? 0,
    total_compensaciones: toNumber(row.total_compensaciones) ?? 0,
    monto_compensaciones: toNumber(row.monto_compensaciones) ?? 0,
    total_soporte: toNumber(row.total_soporte) ?? 0,
    total_consultas: toNumber(row.total_consultas) ?? 0,
    total_payloads_recibidos: toNumber(row.total_payloads_recibidos) ?? 0
});

const groupBySession = (items) => items.reduce((acc, item) => {
    const sessionId = item.id_session_externo;

    if (sessionId === undefined || sessionId === null) {
        return acc;
    }

    if (!acc[sessionId]) {
        acc[sessionId] = [];
    }

    acc[sessionId].push(item);
    return acc;
}, {});

const guardarPayload = async (data, conn = null) => {
    const result = await query(conn).query(
        `INSERT INTO chat_payload_auditoria
        (entity_type, external_id, id_session_externo, id_usuario_externo, raw_payload)
        VALUES ($1, $2, $3, $4, $5::jsonb)
        ON CONFLICT (entity_type, external_id) DO UPDATE SET
            id_session_externo = EXCLUDED.id_session_externo,
            id_usuario_externo = EXCLUDED.id_usuario_externo,
            raw_payload = EXCLUDED.raw_payload,
            received_at = CURRENT_TIMESTAMP
        RETURNING id`,
        [
            data.entity_type,
            data.external_id || null,
            data.id_session_externo || null,
            data.id_usuario_externo || null,
            toJson(data.raw_payload)
        ]
    );

    return result.rows[0].id;
};

const guardarSesion = async (data, conn = null) => {
    const result = await query(conn).query(
        `INSERT INTO chat_sesion_resumen
        (id_session_externo, id_usuario_externo, user_type, current_state,
        previous_state, chat_context, session_status, resolution, start_time,
        end_time, is_active)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11)
        ON CONFLICT (id_session_externo) DO UPDATE SET
            id_usuario_externo = EXCLUDED.id_usuario_externo,
            user_type = EXCLUDED.user_type,
            current_state = EXCLUDED.current_state,
            previous_state = EXCLUDED.previous_state,
            chat_context = EXCLUDED.chat_context,
            session_status = EXCLUDED.session_status,
            resolution = EXCLUDED.resolution,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            is_active = EXCLUDED.is_active,
            update_date = CURRENT_TIMESTAMP
        RETURNING id`,
        [
            data.id_session_externo,
            data.id_usuario_externo,
            data.user_type,
            data.current_state || null,
            data.previous_state || null,
            toJson(data.chat_context),
            data.session_status || 'active',
            data.resolution || null,
            data.start_time || null,
            data.end_time || null,
            data.is_active ?? 1
        ]
    );

    return result.rows[0].id;
};

const guardarMensaje = async (data, conn = null) => {
    const result = await query(conn).query(
        `INSERT INTO chat_mensaje_historial
        (id_mensaje_externo, id_session_externo, message_sender,
        message_content, sent_time, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_mensaje_externo) DO UPDATE SET
            id_session_externo = EXCLUDED.id_session_externo,
            message_sender = EXCLUDED.message_sender,
            message_content = EXCLUDED.message_content,
            sent_time = EXCLUDED.sent_time,
            is_active = EXCLUDED.is_active,
            update_date = CURRENT_TIMESTAMP
        RETURNING id`,
        [
            data.id_mensaje_externo || null,
            data.id_session_externo,
            data.message_sender,
            data.message_content || null,
            data.sent_time || null,
            data.is_active ?? 1
        ]
    );

    return result.rows[0].id;
};

const guardarCompensacion = async (data, conn = null) => {
    const result = await query(conn).query(
        `INSERT INTO chat_compensacion
        (id_compensacion_externo, id_usuario_externo, id_session_externo,
        amount, cupon_code, expiration_date, reason, compensation_type,
        compensation_status, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id_compensacion_externo) DO UPDATE SET
            id_usuario_externo = EXCLUDED.id_usuario_externo,
            id_session_externo = EXCLUDED.id_session_externo,
            amount = EXCLUDED.amount,
            cupon_code = EXCLUDED.cupon_code,
            expiration_date = EXCLUDED.expiration_date,
            reason = EXCLUDED.reason,
            compensation_type = EXCLUDED.compensation_type,
            compensation_status = EXCLUDED.compensation_status,
            is_active = EXCLUDED.is_active,
            update_date = CURRENT_TIMESTAMP
        RETURNING id`,
        [
            data.id_compensacion_externo || null,
            data.id_usuario_externo || null,
            data.id_session_externo || null,
            data.amount ?? null,
            data.cupon_code || null,
            data.expiration_date || null,
            data.reason || null,
            data.compensation_type || null,
            data.compensation_status || 'pendiente',
            data.is_active ?? 1
        ]
    );

    return result.rows[0].id;
};

const guardarSoporte = async (data, conn = null) => {
    const result = await query(conn).query(
        `INSERT INTO chat_support_request
        (id_support_request_externo, id_delivery_externo, id_pedido_externo,
        id_session_externo, id_problem_externo, request_status,
        problem_details, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id_support_request_externo) DO UPDATE SET
            id_delivery_externo = EXCLUDED.id_delivery_externo,
            id_pedido_externo = EXCLUDED.id_pedido_externo,
            id_session_externo = EXCLUDED.id_session_externo,
            id_problem_externo = EXCLUDED.id_problem_externo,
            request_status = EXCLUDED.request_status,
            problem_details = EXCLUDED.problem_details,
            is_active = EXCLUDED.is_active,
            update_date = CURRENT_TIMESTAMP
        RETURNING id`,
        [
            data.id_support_request_externo || null,
            data.id_delivery_externo || null,
            data.id_pedido_externo || null,
            data.id_session_externo || null,
            data.id_problem_externo || null,
            data.request_status || 'pendiente',
            data.problem_details || null,
            data.is_active ?? 1
        ]
    );

    return result.rows[0].id;
};

const guardarConsulta = async (data, conn = null) => {
    const result = await query(conn).query(
        `INSERT INTO chat_order_inquiry
        (id_inquiry_externo, id_session_externo, inquiry_type, input_value,
        inquiry_time, result_found, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id_inquiry_externo) DO UPDATE SET
            id_session_externo = EXCLUDED.id_session_externo,
            inquiry_type = EXCLUDED.inquiry_type,
            input_value = EXCLUDED.input_value,
            inquiry_time = EXCLUDED.inquiry_time,
            result_found = EXCLUDED.result_found,
            is_active = EXCLUDED.is_active,
            update_date = CURRENT_TIMESTAMP
        RETURNING id`,
        [
            data.id_inquiry_externo || null,
            data.id_session_externo,
            data.inquiry_type,
            data.input_value,
            data.inquiry_time || null,
            data.result_found ?? 0,
            data.is_active ?? 1
        ]
    );

    return result.rows[0].id;
};

const getResumenChat = async () => {
    const sesionesResult = await db.query(
        `SELECT
            COUNT(*) AS total_sesiones,
            COUNT(*) FILTER (WHERE session_status = 'active') AS sesiones_activas,
            COUNT(*) FILTER (WHERE resolution = 'resuelto') AS resueltas,
            COUNT(*) FILTER (WHERE resolution = 'escalado_a_agente') AS escaladas,
            AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0) AS minutos_promedio
        FROM chat_sesion_resumen`
    );

    const compensacionesResult = await db.query(
        `SELECT
            compensation_type,
            compensation_status,
            COUNT(*) AS total,
            COALESCE(SUM(amount), 0) AS monto_total
        FROM chat_compensacion
        GROUP BY compensation_type, compensation_status
        ORDER BY compensation_type, compensation_status`
    );

    const soporteResult = await db.query(
        `SELECT request_status, COUNT(*) AS total
        FROM chat_support_request
        GROUP BY request_status
        ORDER BY request_status`
    );

    const consultasResult = await db.query(
        `SELECT inquiry_type, COUNT(*) AS total
        FROM chat_order_inquiry
        GROUP BY inquiry_type
        ORDER BY inquiry_type`
    );

    return {
        sesiones: mapResumenRow(sesionesResult.rows[0] || {}),
        compensaciones: compensacionesResult.rows.map(mapCompensacionResumen),
        soporte: soporteResult.rows.map((row) => mapCountRow(row, 'request_status')),
        consultas: consultasResult.rows.map((row) => mapCountRow(row, 'inquiry_type'))
    };
};

const getReportesClientes = async () => {
    const result = await db.query(
        `SELECT *
        FROM vw_chat_reporte_cliente
        ORDER BY start_time DESC NULLS LAST, id_session_externo DESC`
    );

    return result.rows.map(mapReporteClienteRow);
};

const getReporteCliente = async (idUsuario) => {
    const sesionesResult = await db.query(
        `SELECT *
        FROM chat_sesion_resumen
        WHERE id_usuario_externo = $1
        ORDER BY start_time DESC NULLS LAST, id_session_externo DESC`,
        [idUsuario]
    );

    const sesiones = sesionesResult.rows;
    const sessionIds = sesiones.map((sesion) => sesion.id_session_externo);

    if (!sessionIds.length) {
        return {
            id_usuario_externo: Number(idUsuario),
            total_sesiones: 0,
            total_mensajes: 0,
            total_compensaciones: 0,
            monto_compensaciones: 0,
            sesiones: []
        };
    }

    const mensajesResult = await db.query(
        `SELECT *
        FROM chat_mensaje_historial
        WHERE id_session_externo = ANY($1::bigint[])
        ORDER BY sent_time ASC NULLS LAST, id ASC`,
        [sessionIds]
    );

    const compensacionesResult = await db.query(
        `SELECT *
        FROM chat_compensacion
        WHERE id_usuario_externo = $1 OR id_session_externo = ANY($2::bigint[])
        ORDER BY created_date ASC, id ASC`,
        [idUsuario, sessionIds]
    );

    const soporteResult = await db.query(
        `SELECT *
        FROM chat_support_request
        WHERE id_session_externo = ANY($1::bigint[])
        ORDER BY created_date ASC, id ASC`,
        [sessionIds]
    );

    const consultasResult = await db.query(
        `SELECT *
        FROM chat_order_inquiry
        WHERE id_session_externo = ANY($1::bigint[])
        ORDER BY inquiry_time ASC NULLS LAST, id ASC`,
        [sessionIds]
    );

    const payloadsResult = await db.query(
        `SELECT entity_type, external_id, id_session_externo, id_usuario_externo, raw_payload, received_at
        FROM chat_payload_auditoria
        WHERE id_usuario_externo = $1 OR id_session_externo = ANY($2::bigint[])
        ORDER BY received_at ASC, id ASC`,
        [idUsuario, sessionIds]
    );

    const mensajes = mensajesResult.rows;
    const compensaciones = compensacionesResult.rows.map((item) => ({
        ...item,
        amount: toNumber(item.amount)
    }));
    const soporte = soporteResult.rows;
    const consultas = consultasResult.rows;
    const payloads = payloadsResult.rows;

    const mensajesPorSesion = groupBySession(mensajes);
    const compensacionesPorSesion = groupBySession(compensaciones);
    const soportePorSesion = groupBySession(soporte);
    const consultasPorSesion = groupBySession(consultas);
    const payloadsPorSesion = groupBySession(payloads);

    const sesionesConDetalle = sesiones.map((sesion) => ({
        ...sesion,
        mensajes: mensajesPorSesion[sesion.id_session_externo] || [],
        compensaciones: compensacionesPorSesion[sesion.id_session_externo] || [],
        soporte: soportePorSesion[sesion.id_session_externo] || [],
        consultas: consultasPorSesion[sesion.id_session_externo] || [],
        payloads: payloadsPorSesion[sesion.id_session_externo] || []
    }));

    return {
        id_usuario_externo: Number(idUsuario),
        total_sesiones: sesiones.length,
        total_mensajes: mensajes.length,
        total_compensaciones: compensaciones.length,
        monto_compensaciones: compensaciones.reduce((total, item) => total + (item.amount || 0), 0),
        sesiones: sesionesConDetalle
    };
};

module.exports = {
    guardarPayload,
    guardarSesion,
    guardarMensaje,
    guardarCompensacion,
    guardarSoporte,
    guardarConsulta,
    getResumenChat,
    getReportesClientes,
    getReporteCliente
};
