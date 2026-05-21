const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TipoProducto = sequelize.define('TipoProducto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tipos_producto',
  timestamps: false,
  indexes: [
    { fields: ['activo'] }
  ]
});

module.exports = TipoProducto;
