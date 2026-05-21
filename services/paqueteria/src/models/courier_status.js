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
      unique: true,
      field: 'id_courier',
      references: {
        model: 'courier',
        key: 'id_courier'
      }
    },
    idStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_status',
      references: {
        model: 'courier_status_type',
        key: 'id_status'
      }
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'changed_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
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
      }
    ]
  });
};
