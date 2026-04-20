const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Package', {
    idPackage: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'id_package'
    },
    idShipment: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'shipment',
        key: 'id_shipment'
      },
      field: 'id_shipment'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    weight: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'package',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_package" },
        ]
      },
      {
        name: "fk_package_shipment",
        using: "BTREE",
        fields: [
          { name: "id_shipment" },
        ]
      },
    ]
  });
};
