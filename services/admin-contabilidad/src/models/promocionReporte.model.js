module.exports = (sequelize, DataTypes) => {

  const PromocionReporte = sequelize.define('PromocionReporte', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    promocion_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    pedido_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    monto_descuento: {
      type: DataTypes.FLOAT,
      allowNull: false
    }

  }, {
    tableName: 'promociones_reportes',
    timestamps: true
  });

  return PromocionReporte;
};
