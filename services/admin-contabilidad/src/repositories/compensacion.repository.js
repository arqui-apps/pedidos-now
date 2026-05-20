const { sequelize } = require('../config/db');

const getAllCompensaciones = async () => {
    const result = await sequelize.query(
        'SELECT * FROM compensacion_entidad',
        { type: sequelize.QueryTypes.SELECT }
    );
    return result;
};

const getCompensacionById = async (id) => {
    const result = await sequelize.query(
        'SELECT * FROM compensacion_entidad WHERE id = :id',
        {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result[0];
};

const crearCompensacion = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO compensacion_entidad
        (entidad_comercial_id, motivo, monto, estado, fecha_generacion)
        VALUES (:entidad_id, :motivo, :monto, 'aprobado', NOW())
        RETURNING id`,
        {
            replacements: {
                entidad_id: data.entidad_id,
                motivo: data.motivo,
                monto: data.monto
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0].id;
};

module.exports = {
    crearCompensacion,
    getAllCompensaciones,
    getCompensacionById
};