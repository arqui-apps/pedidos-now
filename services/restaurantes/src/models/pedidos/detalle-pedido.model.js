const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pedidos',
      key: 'id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  combo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'combos',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descuento: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_pedido',
  timestamps: false,
  indexes: [
    { fields: ['pedido_id'] },
    { fields: ['producto_id'] },
    { fields: ['combo_id'] }
  ]
});

module.exports = DetallePedido;
