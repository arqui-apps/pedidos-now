const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurantes',
      key: 'id'
    }
  },
  tipo_producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tipos_producto',
      key: 'id'
    }
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'productos',
  timestamps: false,
  indexes: [
    { fields: ['restaurante_id'] },
    { fields: ['tipo_producto_id'] },
    { fields: ['activo'] }
  ]
});

module.exports = Producto;
