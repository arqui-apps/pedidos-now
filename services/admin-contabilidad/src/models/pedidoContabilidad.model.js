// Admin-contabilidad Victor

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PedidoContabilidad = sequelize.define('PedidoContabilidad', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        entidad_comercial_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        pedido_id_externo: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        tipo_pedido: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        modulo_origen: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        subtotal: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0
        },
        descuento: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0
        },
        comision: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0
        },
        estado: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'pedido_contabilidad',
        timestamps: false
    });

    return PedidoContabilidad;
};