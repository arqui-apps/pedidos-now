const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HorarioRestaurante = sequelize.define('HorarioRestaurante', {
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
  dia_semana: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '0=Lunes, 1=Martes, ..., 6=Domingo'
  },
  hora_apertura: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_cierre: {
    type: DataTypes.TIME,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'horarios_restaurante',
  timestamps: false,
  indexes: [
    { fields: ['restaurante_id'] },
    { fields: ['dia_semana'] }
  ]
});

module.exports = HorarioRestaurante;
