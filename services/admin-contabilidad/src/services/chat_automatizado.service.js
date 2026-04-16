const db = require('../config/db');
const repo = require('../repositories/chat_automatizado.repository');

const required = (data, fields) => {
    const missing = fields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '');

    if (missing.length) {
        const error = new Error(`Campos obligatorios faltantes: ${missing.join(', ')}`);
        error.status = 400;
        throw error;
    }
};

const pick = (data, adminName, chatName) => data[adminName] ?? data[chatName] ?? null;

const mapSesion = (data) => {
    const mapped = {
        id_session_externo: pick(data, 'id_session_externo', 'id_session'),
        id_usuario_externo: pick(data, 'id_usuario_externo', 'id_usuario'),
        user_type: data.user_type,
        current_state: data.current_state,
        previous_state: data.previous_state,
        chat_context: data.chat_context,
        session_status: data.session_status,
        resolution: data.resolution,
        start_time: data.start_time,
        end_time: data.end_time,
        is_active: data.is_active
    };

    required(mapped, ['id_session_externo', 'id_usuario_externo', 'user_type']);
    return mapped;
};

const mapMensaje = (data) => {
    const mapped = {
        id_mensaje_externo: pick(data, 'id_mensaje_externo', 'id_mensaje'),
        id_session_externo: pick(data, 'id_session_externo', 'id_session'),
        message_sender: data.message_sender,
        message_content: data.message_content,
        sent_time: data.sent_time,
        is_active: data.is_active
    };

    required(mapped, ['id_session_externo', 'message_sender']);
    return mapped;
};

const mapCompensacion = (data) => {
    const mapped = {
        id_compensacion_externo: pick(data, 'id_compensacion_externo', 'id_compensacion'),
        id_usuario_externo: pick(data, 'id_usuario_externo', 'id_usuario'),
        id_session_externo: pick(data, 'id_session_externo', 'id_session'),
        amount: data.amount,
        cupon_code: data.cupon_code,
        expiration_date: data.expiration_date,
        reason: data.reason,
        compensation_type: data.compensation_type,
        compensation_status: data.compensation_status,
        is_active: data.is_active
    };

    required(mapped, ['compensation_type']);
    return mapped;
};

const mapSoporte = (data) => {
    const mapped = {
        id_support_request_externo: pick(data, 'id_support_request_externo', 'id_support_request'),
        id_delivery_externo: pick(data, 'id_delivery_externo', 'id_delivery'),
        id_pedido_externo: pick(data, 'id_pedido_externo', 'id_pedido'),
        id_session_externo: pick(data, 'id_session_externo', 'id_session'),
        id_problem_externo: pick(data, 'id_problem_externo', 'id_problem'),
        request_status: data.request_status,
        problem_details: data.problem_details,
        is_active: data.is_active
    };

    required(mapped, ['id_session_externo']);
    return mapped;
};

const mapConsulta = (data) => {
    const mapped = {
        id_inquiry_externo: pick(data, 'id_inquiry_externo', 'id_inquiry'),
        id_session_externo: pick(data, 'id_session_externo', 'id_session'),
        inquiry_type: data.inquiry_type,
        input_value: data.input_value,
        inquiry_time: data.inquiry_time,
        result_found: data.result_found,
        is_active: data.is_active
    };

    required(mapped, ['id_session_externo', 'inquiry_type', 'input_value']);
    return mapped;
};

const payloadData = (entityType, data, mapped, externalId) => ({
    entity_type: entityType,
    external_id: externalId,
    id_session_externo: mapped.id_session_externo,
    id_usuario_externo: mapped.id_usuario_externo,
    raw_payload: data
});

const guardarConPayload = async (data, entityType, mapFn, saveFn, getExternalId) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const mapped = mapFn(data);
        const id = await saveFn(mapped, conn);
        await repo.guardarPayload(payloadData(entityType, data, mapped, getExternalId(mapped)), conn);

        await conn.commit();
        return { ok: true, id };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

const guardarSesion = (data) => guardarConPayload(
    data,
    'sesion',
    mapSesion,
    repo.guardarSesion,
    (mapped) => mapped.id_session_externo
);

const guardarMensaje = (data) => guardarConPayload(
    data,
    'mensaje',
    mapMensaje,
    repo.guardarMensaje,
    (mapped) => mapped.id_mensaje_externo
);

const guardarCompensacion = (data) => guardarConPayload(
    data,
    'compensacion',
    mapCompensacion,
    repo.guardarCompensacion,
    (mapped) => mapped.id_compensacion_externo
);

const guardarSoporte = (data) => guardarConPayload(
    data,
    'soporte',
    mapSoporte,
    repo.guardarSoporte,
    (mapped) => mapped.id_support_request_externo
);

const guardarConsulta = (data) => guardarConPayload(
    data,
    'consulta',
    mapConsulta,
    repo.guardarConsulta,
    (mapped) => mapped.id_inquiry_externo
);

const guardarLote = async (payload) => {
    const conn = await db.getConnection();
    const result = {
        sesiones: 0,
        mensajes: 0,
        compensaciones: 0,
        soporte: 0,
        consultas: 0
    };

    try {
        await conn.beginTransaction();

        for (const item of payload.sesiones || []) {
            const mapped = mapSesion(item);
            await repo.guardarSesion(mapped, conn);
            await repo.guardarPayload(payloadData('sesion', item, mapped, mapped.id_session_externo), conn);
            result.sesiones += 1;
        }

        for (const item of payload.mensajes || []) {
            const mapped = mapMensaje(item);
            await repo.guardarMensaje(mapped, conn);
            await repo.guardarPayload(payloadData('mensaje', item, mapped, mapped.id_mensaje_externo), conn);
            result.mensajes += 1;
        }

        for (const item of payload.compensaciones || []) {
            const mapped = mapCompensacion(item);
            await repo.guardarCompensacion(mapped, conn);
            await repo.guardarPayload(payloadData('compensacion', item, mapped, mapped.id_compensacion_externo), conn);
            result.compensaciones += 1;
        }

        for (const item of payload.soporte || []) {
            const mapped = mapSoporte(item);
            await repo.guardarSoporte(mapped, conn);
            await repo.guardarPayload(payloadData('soporte', item, mapped, mapped.id_support_request_externo), conn);
            result.soporte += 1;
        }

        for (const item of payload.consultas || []) {
            const mapped = mapConsulta(item);
            await repo.guardarConsulta(mapped, conn);
            await repo.guardarPayload(payloadData('consulta', item, mapped, mapped.id_inquiry_externo), conn);
            result.consultas += 1;
        }

        await conn.commit();
        return { ok: true, guardados: result };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

const getResumen = () => repo.getResumenChat();

const getReportesClientes = () => repo.getReportesClientes();

const getReporteCliente = (idUsuario) => repo.getReporteCliente(idUsuario);

module.exports = {
    guardarSesion,
    guardarMensaje,
    guardarCompensacion,
    guardarSoporte,
    guardarConsulta,
    guardarLote,
    getResumen,
    getReportesClientes,
    getReporteCliente
};
