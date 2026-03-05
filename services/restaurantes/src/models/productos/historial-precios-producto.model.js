const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HistorialPreciosProducto = sequelize.define('HistorialPreciosProducto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  precio_anterior: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_nuevo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fecha_cambio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_precios_producto',
  timestamps: false,
  indexes: [
    { fields: ['producto_id'] },
    { fields: ['fecha_cambio'] }
  ]
});

module.exports = HistorialPreciosProducto;
