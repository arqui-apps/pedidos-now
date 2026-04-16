const db = require('../config/db');

const query = (conn) => conn || db;

const normalizeJson = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'string') {
        return value;
    }

    return JSON.stringify(value);
};

const guardarPayload = async (data, conn = null) => {
    const [result] = await query(conn).query(
        `INSERT INTO chat_payload_auditoria
        (entity_type, external_id, id_session_externo, id_usuario_externo, raw_payload)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            id_session_externo = VALUES(id_session_externo),
            id_usuario_externo = VALUES(id_usuario_externo),
            raw_payload = VALUES(raw_payload),
            received_at = CURRENT_TIMESTAMP`,
        [
            data.entity_type,
            data.external_id || null,
            data.id_session_externo || null,
            data.id_usuario_externo || null,
            normalizeJson(data.raw_payload)
        ]
    );

    return result.insertId;
};

const guardarSesion = async (data, conn = null) => {
    const [result] = await query(conn).query(
        `INSERT INTO chat_sesion_resumen
        (id_session_externo, id_usuario_externo, user_type, current_state,
        previous_state, chat_context, session_status, resolution, start_time,
        end_time, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            id_usuario_externo = VALUES(id_usuario_externo),
            user_type = VALUES(user_type),
            current_state = VALUES(current_state),
            previous_state = VALUES(previous_state),
            chat_context = VALUES(chat_context),
            session_status = VALUES(session_status),
            resolution = VALUES(resolution),
            start_time = VALUES(start_time),
            end_time = VALUES(end_time),
            is_active = VALUES(is_active)`,
        [
            data.id_session_externo,
            data.id_usuario_externo,
            data.user_type,
            data.current_state || null,
            data.previous_state || null,
            normalizeJson(data.chat_context),
            data.session_status || 'active',
            data.resolution || null,
            data.start_time || null,
            data.end_time || null,
            data.is_active ?? 1
        ]
    );

    return result.insertId;
};

const guardarMensaje = async (data, conn = null) => {
    const [result] = await query(conn).query(
        `INSERT INTO chat_mensaje_historial
        (id_mensaje_externo, id_session_externo, message_sender,
        message_content, sent_time, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            id_session_externo = VALUES(id_session_externo),
            message_sender = VALUES(message_sender),
            message_content = VALUES(message_content),
            sent_time = VALUES(sent_time),
            is_active = VALUES(is_active)`,
        [
            data.id_mensaje_externo || null,
            data.id_session_externo,
            data.message_sender,
            data.message_content || null,
            data.sent_time || null,
            data.is_active ?? 1
        ]
    );

    return result.insertId;
};

const guardarCompensacion = async (data, conn = null) => {
    const [result] = await query(conn).query(
        `INSERT INTO chat_compensacion
        (id_compensacion_externo, id_usuario_externo, id_session_externo,
        amount, cupon_code, expiration_date, reason, compensation_type,
        compensation_status, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            id_usuario_externo = VALUES(id_usuario_externo),
            id_session_externo = VALUES(id_session_externo),
            amount = VALUES(amount),
            cupon_code = VALUES(cupon_code),
            expiration_date = VALUES(expiration_date),
            reason = VALUES(reason),
            compensation_type = VALUES(compensation_type),
            compensation_status = VALUES(compensation_status),
            is_active = VALUES(is_active)`,
        [
            data.id_compensacion_externo || null,
            data.id_usuario_externo || null,
            data.id_session_externo || null,
            data.amount || null,
            data.cupon_code || null,
            data.expiration_date || null,
            data.reason || null,
            data.compensation_type || null,
            data.compensation_status || 'pendiente',
            data.is_active ?? 1
        ]
    );

    return result.insertId;
};

const guardarSoporte = async (data, conn = null) => {
    const [result] = await query(conn).query(
        `INSERT INTO chat_support_request
        (id_support_request_externo, id_delivery_externo, id_pedido_externo,
        id_session_externo, id_problem_externo, request_status,
        problem_details, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            id_delivery_externo = VALUES(id_delivery_externo),
            id_pedido_externo = VALUES(id_pedido_externo),
            id_session_externo = VALUES(id_session_externo),
            id_problem_externo = VALUES(id_problem_externo),
            request_status = VALUES(request_status),
            problem_details = VALUES(problem_details),
            is_active = VALUES(is_active)`,
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

    return result.insertId;
};

const guardarConsulta = async (data, conn = null) => {
    const [result] = await query(conn).query(
        `INSERT INTO chat_order_inquiry
        (id_inquiry_externo, id_session_externo, inquiry_type, input_value,
        inquiry_time, result_found, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            id_session_externo = VALUES(id_session_externo),
            inquiry_type = VALUES(inquiry_type),
            input_value = VALUES(input_value),
            inquiry_time = VALUES(inquiry_time),
            result_found = VALUES(result_found),
            is_active = VALUES(is_active)`,
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

    return result.insertId;
};

const getResumenChat = async () => {
    const [sesiones] = await db.query(
        `SELECT
            COUNT(*) AS total_sesiones,
            SUM(session_status = 'active') AS sesiones_activas,
            SUM(resolution = 'resuelto') AS resueltas,
            SUM(resolution = 'escalado_a_agente') AS escaladas,
            AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) AS minutos_promedio
        FROM chat_sesion_resumen`
    );

    const [compensaciones] = await db.query(
        `SELECT
            compensation_type,
            compensation_status,
            COUNT(*) AS total,
            IFNULL(SUM(amount), 0) AS monto_total
        FROM chat_compensacion
        GROUP BY compensation_type, compensation_status`
    );

    const [soporte] = await db.query(
        `SELECT request_status, COUNT(*) AS total
        FROM chat_support_request
        GROUP BY request_status`
    );

    const [consultas] = await db.query(
        `SELECT inquiry_type, COUNT(*) AS total
        FROM chat_order_inquiry
        GROUP BY inquiry_type`
    );

    return {
        sesiones: sesiones[0],
        compensaciones,
        soporte,
        consultas
    };
};

const getReportesClientes = async () => {
    const [rows] = await db.query(
        `SELECT *
        FROM vw_chat_reporte_cliente
        ORDER BY start_time DESC, id_session_externo DESC`
    );

    return rows;
};

const getReporteCliente = async (idUsuario) => {
    const [sesiones] = await db.query(
        `SELECT *
        FROM chat_sesion_resumen
        WHERE id_usuario_externo = ?
        ORDER BY start_time DESC, id_session_externo DESC`,
        [idUsuario]
    );

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

    const placeholders = sessionIds.map(() => '?').join(', ');

    const [mensajes] = await db.query(
        `SELECT *
        FROM chat_mensaje_historial
        WHERE id_session_externo IN (${placeholders})
        ORDER BY sent_time ASC, id ASC`,
        sessionIds
    );

    const [compensaciones] = await db.query(
        `SELECT *
        FROM chat_compensacion
        WHERE id_usuario_externo = ? OR id_session_externo IN (${placeholders})
        ORDER BY created_date ASC, id ASC`,
        [idUsuario, ...sessionIds]
    );

    const [soporte] = await db.query(
        `SELECT *
        FROM chat_support_request
        WHERE id_session_externo IN (${placeholders})
        ORDER BY created_date ASC, id ASC`,
        sessionIds
    );

    const [consultas] = await db.query(
        `SELECT *
        FROM chat_order_inquiry
        WHERE id_session_externo IN (${placeholders})
        ORDER BY inquiry_time ASC, id ASC`,
        sessionIds
    );

    const [payloads] = await db.query(
        `SELECT entity_type, external_id, id_session_externo, id_usuario_externo, raw_payload, received_at
        FROM chat_payload_auditoria
        WHERE id_usuario_externo = ? OR id_session_externo IN (${placeholders})
        ORDER BY received_at ASC, id ASC`,
        [idUsuario, ...sessionIds]
    );

    const bySession = (items) => sessionIds.reduce((acc, idSession) => {
        acc[idSession] = items.filter((item) => item.id_session_externo === idSession);
        return acc;
    }, {});

    const mensajesPorSesion = bySession(mensajes);
    const soportePorSesion = bySession(soporte);
    const consultasPorSesion = bySession(consultas);
    const payloadsPorSesion = bySession(payloads);

    const sesionesConDetalle = sesiones.map((sesion) => ({
        ...sesion,
        mensajes: mensajesPorSesion[sesion.id_session_externo] || [],
        compensaciones: compensaciones.filter((item) => item.id_session_externo === sesion.id_session_externo),
        soporte: soportePorSesion[sesion.id_session_externo] || [],
        consultas: consultasPorSesion[sesion.id_session_externo] || [],
        payloads: payloadsPorSesion[sesion.id_session_externo] || []
    }));

    return {
        id_usuario_externo: Number(idUsuario),
        total_sesiones: sesiones.length,
        total_mensajes: mensajes.length,
        total_compensaciones: compensaciones.length,
        monto_compensaciones: compensaciones.reduce((total, item) => total + Number(item.amount || 0), 0),
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
