const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const EstadoPedido = sequelize.define('EstadoPedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'estados_pedido',
  timestamps: false
});

module.exports = EstadoPedido;
