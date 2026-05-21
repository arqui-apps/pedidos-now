const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const HistorialEstadoEntrega = sequelize.define('HistorialEstadoEntrega', {
    id_historial_estado: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    entrega_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'entregas',
            key: 'id_entrega'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'ID de la entrega'
    },
    estado_anterior: {
        type: DataTypes.ENUM(
            'pendiente',
            'asignada',
            'en_ruta',
            'entregada',
            'fallida',
            'cancelada'
        ),
        allowNull: true,
        comment: 'Estado previo de la entrega (NULL en primer registro)'
    },
    estado_nuevo: {
        type: DataTypes.ENUM(
            'pendiente',
            'asignada',
            'en_ruta',
            'entregada',
            'fallida',
            'cancelada'
        ),
        allowNull: false,
        comment: 'Nuevo estado de la entrega'
    },
    cambiado_por_usuario_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del usuario que realizó el cambio de estado'
    },
    repartidor_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'repartidores',
            key: 'id_repartidor'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Contexto: quién era el repartidor en ese momento'
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones o notas sobre el cambio'
    },
    origen_cambio: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'manual',
        comment: 'Origen: manual, repartidor, sistema, negocio'
    }
}, {
    tableName: 'historial_estados_entrega',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['entrega_id'], name: 'idx_hist_entrega' },
        { fields: ['repartidor_id'], name: 'idx_hist_repartidor', where: { repartidor_id: { [sequelize.Sequelize.Op.ne]: null } } },
        { fields: ['estado_nuevo'], name: 'idx_hist_estado_nuevo' },
        { fields: ['created_at'], name: 'idx_hist_fecha' },
        { fields: ['origen_cambio'], name: 'idx_hist_origen' }
    ],
    comment: 'Auditoría completa de cambios de estado de entregas'
});

module.exports = HistorialEstadoEntrega;
