const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const CalificacionEntrega = sequelize.define('CalificacionEntrega', {
    id_calificacion: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    entrega_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        references: {
            model: 'entregas',
            key: 'id_entrega'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'ID de la entrega calificada'
    },
    repartidor_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'repartidores',
            key: 'id_repartidor'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'ID del repartidor calificado'
    },
    puntuacion: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        },
        comment: 'Calificación del cliente (1-5)'
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comentario opcional del cliente'
    },
    calificado_por: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'cliente',
        comment: 'Quién realizó la calificación: cliente, negocio, admin'
    }
}, {
    tableName: 'calificaciones_entrega',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['repartidor_id'], name: 'idx_calif_repartidor' },
        { fields: ['puntuacion'], name: 'idx_calif_puntuacion' }
    ],
    comment: 'Calificación del repartidor al completar la entrega. Una por entrega'
});

module.exports = CalificacionEntrega;
