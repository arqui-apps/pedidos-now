// db exporta { pool, sequelize, query }.
// Usamos query: acepta ? como placeholder y los convierte a $1,$2 internamente.
const { query: db } = require('../config/db');

// ── chat_resolucion_financiera ───────────────────────────────

const insertarResolucion = async ({ conversation_id, tipo_resolucion, requester_type, requester_ext_id, case_type, case_reference }) => {
    const [rows] = await db(
        `INSERT INTO chat_resolucion_financiera
            (conversation_id, tipo_resolucion, requester_type, requester_ext_id, case_type, case_reference)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING id`,
        [conversation_id, tipo_resolucion, requester_type, requester_ext_id, case_type || 'OTHER', case_reference || null]
    );
    return rows[0].id;
};

const actualizarResolucion = async (id, { reembolso_id, compensacion_id, movimiento_id, estado, notas }) => {
    await db(
        `UPDATE chat_resolucion_financiera
         SET reembolso_id    = COALESCE(?, reembolso_id),
             compensacion_id = COALESCE(?, compensacion_id),
             movimiento_id   = COALESCE(?, movimiento_id),
             estado          = COALESCE(?, estado),
             notas           = COALESCE(?, notas),
             actualizado_en  = NOW()
         WHERE id = ?`,
        [reembolso_id || null, compensacion_id || null, movimiento_id || null, estado || null, notas || null, id]
    );
};

const buscarPorConversacion = async (conversation_id) => {
    const [rows] = await db(
        `SELECT * FROM chat_resolucion_financiera WHERE conversation_id = ? LIMIT 1`,
        [conversation_id]
    );
    return rows[0] || null;
};

const listarResoluciones = async ({ estado, tipo_resolucion, limit = 50, offset = 0 } = {}) => {
    const condiciones = [];
    const valores = [];

    if (estado)          { condiciones.push(`estado = ?`);          valores.push(estado); }
    if (tipo_resolucion) { condiciones.push(`tipo_resolucion = ?`); valores.push(tipo_resolucion); }

    valores.push(Number(limit), Number(offset));
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const [rows] = await db(
        `SELECT * FROM chat_resolucion_financiera ${where}
         ORDER BY creado_en DESC
         LIMIT ? OFFSET ?`,
        valores
    );
    return rows;
};

const buscarResolucionPorId = async (id) => {
    const [rows] = await db(
        `SELECT * FROM chat_resolucion_financiera WHERE id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};

// ── chat_estadistica_periodo ─────────────────────────────────

const insertarEstadistica = async ({ periodo_inicio, periodo_fin, reporte_id, stats }) => {
    const [rows] = await db(
        `INSERT INTO chat_estadistica_periodo
            (periodo_inicio, periodo_fin, reporte_id,
             total_conversaciones, resueltas_reembolso, resueltas_cupon,
             resueltas_sin_solucion, cerradas_timeout, cerradas_manual,
             monto_reembolsado, monto_compensado)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         RETURNING id`,
        [
            periodo_inicio, periodo_fin, reporte_id || null,
            stats.total_conversaciones   || 0,
            stats.resueltas_reembolso    || 0,
            stats.resueltas_cupon        || 0,
            stats.resueltas_sin_solucion || 0,
            stats.cerradas_timeout       || 0,
            stats.cerradas_manual        || 0,
            stats.monto_reembolsado      || 0,
            stats.monto_compensado       || 0
        ]
    );
    return rows[0].id;
};

const buscarEstadisticaPorPeriodo = async (periodo_inicio, periodo_fin) => {
    const [rows] = await db(
        `SELECT * FROM chat_estadistica_periodo
         WHERE periodo_inicio = ? AND periodo_fin = ?
         ORDER BY generado_en DESC LIMIT 1`,
        [periodo_inicio, periodo_fin]
    );
    return rows[0] || null;
};

const obtenerMontosPorPeriodo = async (periodo_inicio, periodo_fin) => {
    const [resRows] = await db(
        `SELECT COALESCE(SUM(rc.monto), 0) AS total
         FROM chat_resolucion_financiera crf
         JOIN reembolso_cliente rc ON rc.id = crf.reembolso_id
         WHERE crf.estado = 'procesado'
           AND crf.creado_en BETWEEN ? AND ?`,
        [periodo_inicio, `${periodo_fin} 23:59:59`]
    );
    const [compRows] = await db(
        `SELECT COALESCE(SUM(ce.monto), 0) AS total
         FROM chat_resolucion_financiera crf
         JOIN compensacion_entidad ce ON ce.id = crf.compensacion_id
         WHERE crf.estado = 'procesado'
           AND crf.creado_en BETWEEN ? AND ?`,
        [periodo_inicio, `${periodo_fin} 23:59:59`]
    );
    return {
        monto_reembolsado: Number(resRows[0].total),
        monto_compensado:  Number(compRows[0].total)
    };
};

// ── chat_llamada_log ─────────────────────────────────────────

const registrarLlamada = async ({ metodo, endpoint, conversation_id, payload, http_status, respuesta, duracion_ms, error_mensaje }) => {
    await db(
        `INSERT INTO chat_llamada_log
            (metodo, endpoint, conversation_id, payload, http_status, respuesta, duracion_ms, error_mensaje)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            metodo,
            endpoint,
            conversation_id || null,
            payload   ? JSON.stringify(payload)   : null,
            http_status   || null,
            respuesta ? JSON.stringify(respuesta) : null,
            duracion_ms   || null,
            error_mensaje || null
        ]
    );
};

module.exports = {
    insertarResolucion,
    actualizarResolucion,
    buscarPorConversacion,
    listarResoluciones,
    buscarResolucionPorId,
    insertarEstadistica,
    buscarEstadisticaPorPeriodo,
    obtenerMontosPorPeriodo,
    registrarLlamada
};
