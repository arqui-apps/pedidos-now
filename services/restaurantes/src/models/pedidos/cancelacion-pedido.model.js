const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CancelacionPedido = sequelize.define('CancelacionPedido', {
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
  cancelado_por: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'cliente, restaurante, admin'
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado_al_cancelar: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  aplica_multa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  monto_multa: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  fecha_cancelacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cancelaciones_pedido',
  timestamps: false,
  indexes: [
    { fields: ['pedido_id'] },
    { fields: ['fecha_cancelacion'] }
  ]
});

module.exports = CancelacionPedido;
