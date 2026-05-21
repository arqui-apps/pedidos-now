const db = require('../config/db');

const getAllCompensaciones = async () => {
    const [rows] = await db.query(
        'SELECT * FROM compensacion_entidad'
    );
    return rows;
};

const getCompensacionById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM compensacion_entidad WHERE id = ?',
        [id]
    );
    return rows[0];
};

const crearCompensacion = async (data) => {
    const [result] = await db.query(
        `INSERT INTO compensacion_entidad
        (entidad_comercial_id, motivo, 
        monto, estado)
        VALUES (?, ?, ?, 'aprobado')`,
        [data.entidad_id, data.motivo, data.monto]
    );
    return result.insertId;
};

module.exports = {
    crearCompensacion,
    getAllCompensaciones,
    getCompensacionById
};