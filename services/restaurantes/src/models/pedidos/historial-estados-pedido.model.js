const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HistorialEstadosPedido = sequelize.define('HistorialEstadosPedido', {
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
  estado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'estados_pedido',
      key: 'id'
    }
  },
  fecha_cambio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'historial_estados_pedido',
  timestamps: false,
  indexes: [
    { fields: ['pedido_id'] },
    { fields: ['estado_id'] },
    { fields: ['fecha_cambio'] }
  ]
});

module.exports = HistorialEstadosPedido;
