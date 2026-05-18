// Admin-contabilidad Victor

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EntidadComercial = sequelize.define('EntidadComercial', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        entidad_id_externo: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        nombre_comercial: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        creado_en: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'entidad_comercial',
        timestamps: false
    });

    return EntidadComercial;
};