const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HistorialInventario = sequelize.define('HistorialInventario', {
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
  tipo_movimiento: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  cantidad_resultante: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pedidos',
      key: 'id'
    }
  },
  detalle_entrada_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'detalle_entrada_inventario',
      key: 'id'
    }
  },
  usuario_responsable: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_inventario',
  timestamps: false,
  indexes: [
    { fields: ['producto_id'] },
    { fields: ['tipo_movimiento'] },
    { fields: ['fecha_movimiento'] }
  ]
});

module.exports = HistorialInventario;
