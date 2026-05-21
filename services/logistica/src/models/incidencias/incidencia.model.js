const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const IncidenciaEntrega = sequelize.define('IncidenciaEntrega', {
    id_incidencia: {
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
        comment: 'ID de la entrega afectada'
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
        comment: 'ID del repartidor que reportó (si aplica)'
    },
    tipo_incidencia: {
        type: DataTypes.ENUM(
            'direccion_incorrecta',
            'cliente_ausente',
            'paquete_danado',
            'rechazo_cliente',
            'accidente',
            'otro'
        ),
        allowNull: false,
        comment: 'Tipo de incidencia reportada'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Descripción detallada de la incidencia'
    },
    resuelta: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la incidencia fue resuelta'
    },
    resuelta_por_usuario_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID del usuario que resolvió la incidencia'
    },
    comentario_resolucion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comentario sobre la resolución'
    },
    resuelta_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora de resolución'
    }
}, {
    tableName: 'incidencias_entrega',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['entrega_id'], name: 'idx_inc_entrega' },
        { fields: ['repartidor_id'], name: 'idx_inc_repartidor', where: { repartidor_id: { [sequelize.Sequelize.Op.ne]: null } } },
        { fields: ['tipo_incidencia'], name: 'idx_inc_tipo' },
        { fields: ['resuelta'], name: 'idx_inc_resuelta', where: { resuelta: false } }
    ],
    comment: 'Registro de incidencias operativas durante entregas'
});

module.exports = IncidenciaEntrega;
