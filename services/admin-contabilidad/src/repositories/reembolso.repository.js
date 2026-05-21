const db = require('../config/db');

const getAllReembolsos = async () => {
    const [rows] = await db.query(
        'SELECT * FROM reembolso_cliente'
    );
    return rows;
};

const crearReembolsoConn = async (conn, data) => {
    const [result] = await conn.query(
        `INSERT INTO reembolso_cliente 
        (usuario_ref_id, pedido_id_externo, motivo, monto, estado)
        VALUES (?, ?, ?, ?, 'procesado')`,
        [
            data.usuario_id, 
            data.pedido_id, 
            data.motivo, 
            data.monto
        ]
    );
    return result.insertId;
}

module.exports = {
    crearReembolsoConn,
    getAllReembolsos
};