const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const HistorialUbicacionRepartidor = sequelize.define('HistorialUbicacionRepartidor', {
    id_ubicacion: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    repartidor_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'repartidores',
            key: 'id_repartidor'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID del repartidor'
    },
    entrega_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'entregas',
            key: 'id_entrega'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'ID de la entrega (NULL si está disponible sin pedido activo)'
    },
    lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        comment: 'Latitud'
    },
    lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        comment: 'Longitud'
    },
    heading: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Dirección en grados (0-360) para animar el pin'
    }
}, {
    tableName: 'historial_ubicaciones_repartidor',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['repartidor_id', { attribute: 'created_at', order: 'DESC' }], name: 'idx_ubic_repartidor_time' },
        { fields: ['entrega_id'], name: 'idx_ubic_entrega', where: { entrega_id: { [sequelize.Sequelize.Op.ne]: null } } }
    ],
    comment: 'Posiciones emitidas por WebSocket. Permite rastreo y auditoría de recorridos'
});

module.exports = HistorialUbicacionRepartidor;
