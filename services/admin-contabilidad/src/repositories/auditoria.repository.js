const { sequelize } = require('../config/db');

const registrarLog = async (data, transaction = null) => {
    await sequelize.query(
        `INSERT INTO auditoria_financiera (accion, descripcion, monto)
         VALUES (:accion, :descripcion, :monto)`,
        {
            replacements: {
                accion: data.accion,
                descripcion: data.descripcion,
                monto: data.monto || null
            },
            transaction
        }
    );
};

module.exports = { registrarLog };