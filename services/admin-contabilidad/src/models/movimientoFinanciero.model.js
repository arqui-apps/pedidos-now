// Admin-contabilidad Victor

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MovimientoFinanciero = sequelize.define('MovimientoFinanciero', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        cuenta_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        subtipo: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        modulo_origen: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        referencia_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        monto: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        pedido_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        repartidor_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        estado: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        transaction_id_banco: {
            type: DataTypes.STRING,
            allowNull: true
        },
        payment_id_cobros: {
            type: DataTypes.STRING,
            allowNull: true
        },
        idempotency_key: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'movimiento_financiero',
        timestamps: false
    });

    return MovimientoFinanciero;
};