const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CourierStatus', {
    idCourierStatus: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'id_courier_status'
    },
    idCourier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "id_courier",
      references: {
        model: 'courier',
        key: 'id_courier'
      },
      field: 'id_courier'
    },
    idStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courier_status_type',
        key: 'id_status'
      },
      field: 'id_status'
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'changed_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at'
    }
  }, {
    sequelize,
    tableName: 'courier_status',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_courier_status" }
        ]
      },
      {
        name: "id_courier",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_courier" }
        ]
      },
      {
        name: "fk_courier_status_type",
        using: "BTREE",
        fields: [
          { name: "id_status" }
        ]
      }
    ]
  });
};