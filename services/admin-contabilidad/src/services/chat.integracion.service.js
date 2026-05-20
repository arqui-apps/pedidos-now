const repo   = require('../repositories/chat.integracion.repository');
const client = require('../config/chats.client');

// Wrapper que ejecuta la llamada HTTP y registra el log en una sola operación
async function llamarChats({ metodo, endpoint, params, body, conversation_id, token }) {
    const inicio = Date.now();
    let http_status = null;
    let respuesta   = null;
    let error_msg   = null;

    try {
        const data = metodo === 'GET'
            ? await client.get(endpoint, params, token)
            : await client.patch(endpoint, body, token);

        http_status = 200;
        respuesta   = data;
        return data;

    } catch (err) {
        http_status = err.response?.status || null;
        respuesta   = err.response?.data   || null;
        error_msg   = err.message;
        const error = new Error(err.response?.data?.error?.message || err.message);
        error.status = http_status || 502;
        throw error;

    } finally {
        await repo.registrarLlamada({
            metodo,
            endpoint,
            conversation_id: conversation_id || null,
            payload:         metodo === 'GET' ? params : body,
            http_status,
            respuesta,
            duracion_ms:     Date.now() - inicio,
            error_mensaje:   error_msg
        });
    }
}

// ── Inbound: Chats notifica que cerró una conversación ───────
// El broker llama este servicio cuando Chats resuelve una
// conversación con RESOLVED_REFUND o RESOLVED_COUPON.
// Solo registra el evento como pendiente. El agente admin
// revisa el chat, fija el monto y usa el endpoint /procesar.
const procesarResolucionEntrante = async (payload) => {
    const {
        conversation_id, requester_type, requester_ext_id, case_type, case_reference,
        tipo_resolucion,  // formato interno / pruebas manuales
        status            // formato webhook del servicio de Chats
    } = payload;

    const resolucion = tipo_resolucion || status;

    if (!conversation_id || !resolucion || !requester_type || !requester_ext_id) {
        const err = new Error('Faltan campos obligatorios: conversation_id, tipo_resolucion (o status), requester_type, requester_ext_id');
        err.status = 400;
        throw err;
    }

    const existente = await repo.buscarPorConversacion(conversation_id);
    if (existente) {
        return { chat_resolucion_id: existente.id, estado: existente.estado, ya_existia: true };
    }

    const id = await repo.insertarResolucion({
        conversation_id, tipo_resolucion: resolucion, requester_type,
        requester_ext_id, case_type, case_reference
    });

    return { chat_resolucion_id: id, estado: 'pendiente', ya_existia: false };
};

// Marca una resolución como procesada, vinculando el reembolso
// o compensación que el agente admin creó por los endpoints existentes
const procesarResolucion = async (id, { reembolso_id, compensacion_id, notas }) => {
    const resolucion = await repo.listarResoluciones({});
    const registro = resolucion.find(r => r.id === Number(id));

    if (!registro) {
        const err = new Error('Resolución no encontrada');
        err.status = 404;
        throw err;
    }

    if (registro.estado === 'procesado') {
        const err = new Error('Esta resolución ya fue procesada');
        err.status = 409;
        throw err;
    }

    await repo.actualizarResolucion(id, { reembolso_id, compensacion_id, estado: 'procesado', notas });
    return { ok: true, id: Number(id), estado: 'procesado' };
};

// ── Outbound: consultas al servicio de Chats vía Broker ─────

const listarConversaciones = async (filtros, token) => {
    return llamarChats({
        metodo:   'GET',
        endpoint: '/api/conversations',
        params:   filtros,
        token
    });
};

const obtenerConversacion = async (conversation_id, token) => {
    return llamarChats({
        metodo:          'GET',
        endpoint:        `/api/conversations/${conversation_id}`,
        conversation_id,
        token
    });
};

const obtenerMensajes = async (conversation_id, { page, limit } = {}, token) => {
    return llamarChats({
        metodo:          'GET',
        endpoint:        `/api/conversations/${conversation_id}/messages`,
        params:          { page, limit },
        conversation_id,
        token
    });
};

const cambiarEstadoConversacion = async (conversation_id, { new_status, changed_by_ext_id, reason }, token) => {
    const VALIDOS = ['RESOLVED_REFUND', 'RESOLVED_COUPON', 'RESOLVED_NO_SOLUTION', 'CLOSED_MANUAL'];
    if (!VALIDOS.includes(new_status)) {
        const err = new Error(`new_status debe ser uno de: ${VALIDOS.join(', ')}`);
        err.status = 400;
        throw err;
    }
    return llamarChats({
        metodo:          'PATCH',
        endpoint:        `/api/conversations/${conversation_id}/status`,
        body:            { new_status, changed_by_ext_id, reason },
        conversation_id,
        token
    });
};

const asignarAgente = async (conversation_id, { agent_ext_id, agent_display_name }, token) => {
    if (!agent_ext_id) {
        const err = new Error('agent_ext_id es obligatorio');
        err.status = 400;
        throw err;
    }
    return llamarChats({
        metodo:          'PATCH',
        endpoint:        `/api/conversations/${conversation_id}/assign-agent`,
        body:            { agent_ext_id, agent_display_name },
        conversation_id,
        token
    });
};

// ── Reporte: estadísticas de chats por período ───────────────

const generarEstadisticasPeriodo = async ({ periodo_inicio, periodo_fin, reporte_id }, token) => {
    const estados = [
        'RESOLVED_REFUND', 'RESOLVED_COUPON',
        'RESOLVED_NO_SOLUTION', 'CLOSED_TIMEOUT', 'CLOSED_MANUAL'
    ];

    // Consulta en paralelo el total de cada estado al servicio de Chats.
    // Response real: { success, data: { items, pagination: { total } }, message }
    const totales = await Promise.all(
        estados.map(status =>
            llamarChats({
                metodo:   'GET',
                endpoint: '/api/conversations',
                params:   { status, from_date: periodo_inicio, to_date: periodo_fin, limit: 1 },
                token
            }).then(r => r?.data?.pagination?.total || 0).catch(() => 0)
        )
    );

    const [refund, cupon, sin_sol, timeout, manual] = totales;

    // Los montos reales vienen de nuestra propia DB (reembolsos/compensaciones ya procesados)
    const montos = await repo.obtenerMontosPorPeriodo(periodo_inicio, periodo_fin);

    const stats = {
        total_conversaciones:   refund + cupon + sin_sol + timeout + manual,
        resueltas_reembolso:    refund,
        resueltas_cupon:        cupon,
        resueltas_sin_solucion: sin_sol,
        cerradas_timeout:       timeout,
        cerradas_manual:        manual,
        monto_reembolsado:      montos.monto_reembolsado,
        monto_compensado:       montos.monto_compensado
    };

    const id = await repo.insertarEstadistica({ periodo_inicio, periodo_fin, reporte_id, stats });
    return { id, ...stats };
};

module.exports = {
    procesarResolucionEntrante,
    procesarResolucion,
    listarConversaciones,
    obtenerConversacion,
    obtenerMensajes,
    cambiarEstadoConversacion,
    asignarAgente,
    generarEstadisticasPeriodo
};
