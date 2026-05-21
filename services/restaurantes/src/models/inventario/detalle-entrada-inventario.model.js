const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DetalleEntradaInventario = sequelize.define('DetalleEntradaInventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entrada_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'entradas_inventario',
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
  cantidad_recibida: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  cantidad_rechazada: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  precio_unitario_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'detalle_entrada_inventario',
  timestamps: false,
  indexes: [
    { fields: ['entrada_id'] },
    { fields: ['producto_id'] }
  ]
});

module.exports = DetalleEntradaInventario;
