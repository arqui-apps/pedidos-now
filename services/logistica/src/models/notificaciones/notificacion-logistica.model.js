const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const NotificacionLogistica = sequelize.define('NotificacionLogistica', {
    id_notificacion: {
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
    evento: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Evento notificado: ACCEPTED, PICKED_UP, DELIVERED, CANCELLED, FAILED'
    },
    destino_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Endpoint del módulo de negocios'
    },
    payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Cuerpo enviado en la notificación'
    },
    exitosa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la notificación fue exitosa'
    },
    http_status: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: 'Código de estado HTTP de la respuesta'
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Respuesta del servidor'
    },
    intentos: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos realizados'
    },
    ultimo_intento_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora del último intento'
    }
}, {
    tableName: 'notificaciones_logistica',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['entrega_id'], name: 'idx_notif_entrega' },
        { fields: ['exitosa'], name: 'idx_notif_exitosa', where: { exitosa: false } },
        { fields: ['evento'], name: 'idx_notif_evento' },
        { fields: ['created_at'], name: 'idx_notif_fecha' }
    ],
    comment: 'Log de notificaciones enviadas al módulo de negocios. Permite reintentos'
});

module.exports = NotificacionLogistica;
