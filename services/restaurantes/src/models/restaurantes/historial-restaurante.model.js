const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HistorialRestaurante = sequelize.define('HistorialRestaurante', {
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
  tipo_evento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_evento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_restaurante',
  timestamps: false,
  indexes: [
    { fields: ['restaurante_id'] },
    { fields: ['fecha_evento'] }
  ]
});

module.exports = HistorialRestaurante;
