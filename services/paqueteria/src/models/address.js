const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Address', {
    idAddress: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'id_address'
    },
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id_user'
      },
      field: 'id_user'
    },
    latitude: {
      type: DataTypes.DECIMAL(10,8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11,8),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'address',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_address" },
        ]
      },
      {
        name: "fk_address_user",
        using: "BTREE",
        fields: [
          { name: "id_user" },
        ]
      },
    ]
  });
};
