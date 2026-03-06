const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ComboProducto = sequelize.define('ComboProducto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  combo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'combos',
      key: 'id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'combo_productos',
  timestamps: false,
  indexes: [
    { fields: ['combo_id'] },
    { fields: ['producto_id'] }
  ]
});

module.exports = ComboProducto;
