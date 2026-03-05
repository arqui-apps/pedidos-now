const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Combo = sequelize.define('Combo', {
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
  tipo_combo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tipos_combo',
      key: 'id'
    }
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'combos',
  timestamps: false,
  indexes: [
    { fields: ['restaurante_id'] },
    { fields: ['tipo_combo_id'] },
    { fields: ['activo'] }
  ]
});

module.exports = Combo;
