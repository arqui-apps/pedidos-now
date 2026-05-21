const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const EntradaInventario = sequelize.define('EntradaInventario', {
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
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  recibido_por: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_recepcion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'entradas_inventario',
  timestamps: false,
  indexes: [
    { fields: ['restaurante_id'] },
    { fields: ['proveedor_id'] },
    { fields: ['estado'] }
  ]
});

module.exports = EntradaInventario;
