const service = require('../services/chat.integracion.service');
const repo    = require('../repositories/chat.integracion.repository');

function getToken(req) {
    const auth = req.headers.authorization || '';
    return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function handleError(res, error) {
    console.error(error);
    return res.status(error.status || 500).json({ ok: false, error: error.message });
}

// POST /api/chats/resolucion
// Inbound: el Broker llama aquí cuando Chats cierra una conversación con acción financiera.
const recibirResolucion = async (req, res) => {
    try {
        const data = await service.procesarResolucionEntrante(req.body);
        return res.status(data.ya_existia ? 200 : 201).json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/chats/resoluciones
// Lista resoluciones pendientes para revisión del agente admin.
// Query params: estado (pendiente|procesado|rechazado), tipo_resolucion, limit, offset
const listarResoluciones = async (req, res) => {
    try {
        const data = await repo.listarResoluciones(req.query);
        return res.json({ ok: true, data, count: data.length });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH /api/chats/resoluciones/:id/procesar
// El agente admin ya creó el reembolso o compensación por los endpoints existentes
// (/api/reembolsos o /api/compensaciones) y aquí vincula el ID resultante.
const procesarResolucion = async (req, res) => {
    try {
        const data = await service.procesarResolucion(req.params.id, req.body);
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/chats/conversaciones
// Lista conversaciones del servicio de Chats (para reportes y dashboard).
const listarConversaciones = async (req, res) => {
    try {
        const data = await service.listarConversaciones(req.query, getToken(req));
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/chats/conversaciones/:id
const obtenerConversacion = async (req, res) => {
    try {
        const data = await service.obtenerConversacion(req.params.id, getToken(req));
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/chats/conversaciones/:id/mensajes
// Historial de mensajes como evidencia al revisar un reembolso.
const obtenerMensajes = async (req, res) => {
    try {
        const data = await service.obtenerMensajes(req.params.id, req.query, getToken(req));
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH /api/chats/conversaciones/:id/estado
// Cierra la conversación en Chats después de procesar el reembolso/compensación.
const cambiarEstado = async (req, res) => {
    try {
        const data = await service.cambiarEstadoConversacion(req.params.id, req.body, getToken(req));
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH /api/chats/conversaciones/:id/agente
// Reasigna un agente de soporte desde el panel de Admin.
const asignarAgente = async (req, res) => {
    try {
        const data = await service.asignarAgente(req.params.id, req.body, getToken(req));
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/chats/estadisticas?periodo_inicio=YYYY-MM-DD&periodo_fin=YYYY-MM-DD
const generarEstadisticas = async (req, res) => {
    try {
        const { periodo_inicio, periodo_fin, reporte_id } = req.query;
        if (!periodo_inicio || !periodo_fin) {
            return res.status(400).json({ ok: false, error: 'periodo_inicio y periodo_fin son requeridos' });
        }
        const data = await service.generarEstadisticasPeriodo(
            { periodo_inicio, periodo_fin, reporte_id },
            getToken(req)
        );
        return res.json({ ok: true, data });
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    recibirResolucion,
    listarResoluciones,
    procesarResolucion,
    listarConversaciones,
    obtenerConversacion,
    obtenerMensajes,
    cambiarEstado,
    asignarAgente,
    generarEstadisticas
};
