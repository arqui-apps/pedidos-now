const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Pedido = sequelize.define('Pedido', {
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
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del cliente del servicio Auth'
  },
  repartidor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del repartidor del servicio Broker'
  },
  estado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'estados_pedido',
      key: 'id'
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descuento_aplicado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  direccion_entrega: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cobro_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID del cobro del servicio Cobros'
  },
  fecha_pedido: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pedidos',
  timestamps: false,
  indexes: [
    { fields: ['restaurante_id'] },
    { fields: ['cliente_id'] },
    { fields: ['estado_id'] },
    { fields: ['fecha_pedido'] }
  ]
});

module.exports = Pedido;
