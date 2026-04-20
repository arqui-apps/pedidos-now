const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Shipment', {
    idShipment: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'id_shipment'
    },
    deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'delivery_instructions'
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    shipmentStatus: {
      type: DataTypes.ENUM('pending','assigned','in_transit','delivered','cancelled'),
      allowNull: true,
      field: 'shipment_status'
    },
    chargeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'charge_type'
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'estimated_delivery_time'
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id_user'
      },
      field: 'sender_id'
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id_user'
      },
      field: 'receiver_id'
    },
    courierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courier',
        key: 'id_courier'
      },
      field: 'courier_id'
    },
    invoiceSeries: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'invoice_series'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'shipment',
    timestamps: true,
    createdAt: 'created_at',   
    updatedAt: 'updated_at',   
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_shipment" },
        ]
      },
      {
        name: "fk_shipment_sender",
        using: "BTREE",
        fields: [
          { name: "sender_id" },
        ]
      },
      {
        name: "fk_shipment_receiver",
        using: "BTREE",
        fields: [
          { name: "receiver_id" },
        ]
      },
      {
        name: "fk_shipment_courier",
        using: "BTREE",
        fields: [
          { name: "courier_id" },
        ]
      },
    ]
  });
};
