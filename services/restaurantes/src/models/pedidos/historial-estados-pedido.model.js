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
    allowNull: false
  },
  estado_nombre: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelado_por: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  aplica_multa: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  monto_multa: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  fecha_cambio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_estados_pedido',
  timestamps: false,
  indexes: [
    { fields: ['pedido_id'] },
    { fields: ['fecha_cambio'] }
  ]
});

module.exports = HistorialEstadosPedido;
