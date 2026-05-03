const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ShipmentTracking', {
    idTracking: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'id_tracking'
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
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    locationLat: {
      type: DataTypes.DECIMAL(10,8),
      allowNull: true,
      field: 'location_lat'
    },
    locationLng: {
      type: DataTypes.DECIMAL(11,8),
      allowNull: true,
      field: 'location_lng'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'created_at'
    }
  }, {
    sequelize,
    tableName: 'shipment_tracking',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_tracking" },
        ]
      },
      {
        name: "fk_tracking_shipment",
        using: "BTREE",
        fields: [
          { name: "id_shipment" },
        ]
      },
    ]
  });
};