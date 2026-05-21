const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const CategoriaOrden = sequelize.define('CategoriaOrden', {
    id_categoria: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código técnico: FOOD, MARKET, PHARMACY, PACKAGE'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre descriptivo de la categoría'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción para el panel de administración'
    },
    icono: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nombre del ícono en la UI'
    },
    color_hex: {
        type: DataTypes.STRING(7),
        allowNull: true,
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/
        },
        comment: 'Color en formato hexadecimal'
    },
    orden_display: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de visualización en el feed'
    },
    activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la categoría está activa'
    }
}, {
    tableName: 'categorias_orden',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['activa'], name: 'idx_categorias_activa', where: { activa: true } },
        { fields: ['orden_display'], name: 'idx_categorias_orden_disp' }
    ],
    comment: 'Tipos de negocio/pedido gestionados por administración'
});

module.exports = CategoriaOrden;
