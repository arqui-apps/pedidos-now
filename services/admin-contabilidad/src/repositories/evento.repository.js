// Admin-contabilidad Kenneth

const db = require('../config/db');

const guardarEvento = async ({ modulo_origen, tipo_evento, referencia_id, payload }) => {

    const result = await db.query(
        `INSERT INTO evento_sistema
        (modulo_origen, tipo_evento, referencia_id, payload)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [
            modulo_origen,
            tipo_evento,
            referencia_id,
            JSON.stringify(payload)
        ]
    );

    return result.rows[0].id;
};

module.exports = {
    guardarEvento
};