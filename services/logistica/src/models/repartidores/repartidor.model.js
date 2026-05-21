const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const Repartidor = sequelize.define('Repartidor', {
    id_repartidor: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        comment: 'FK al módulo de usuarios'
    },
    estado: {
        type: DataTypes.ENUM('disponible', 'ocupado', 'inactivo'),
        allowNull: false,
        defaultValue: 'inactivo',
        comment: 'Estado del repartidor: disponible aparece en feed'
    },
    ultima_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        comment: 'Última latitud conocida'
    },
    ultima_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        comment: 'Última longitud conocida'
    },
    ultima_ubicacion_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp de última actualización de ubicación'
    },
    ws_estado: {
        type: DataTypes.ENUM('conectado', 'desconectado'),
        allowNull: false,
        defaultValue: 'desconectado',
        comment: 'Estado de conexión WebSocket'
    },
    ws_conectado_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp de última conexión WebSocket'
    },
    ws_desconectado_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp de última desconexión WebSocket'
    },
    total_entregas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de entregas completadas'
    },
    total_cancelaciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de cancelaciones'
    },
    calificacion_promedio: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 5
        },
        comment: 'Calificación promedio (0.00 - 5.00)'
    }
}, {
    tableName: 'repartidores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['estado'], name: 'idx_repartidores_estado' },
        { fields: ['ws_estado'], name: 'idx_repartidores_ws' },
        { 
            fields: ['ultima_lat', 'ultima_lng'], 
            name: 'idx_repartidores_ubicacion',
            where: { ultima_lat: { [sequelize.Sequelize.Op.ne]: null } }
        }
    ],
    comment: 'Perfil logístico del repartidor. Datos de usuario en módulo externo'
});

module.exports = Repartidor;
