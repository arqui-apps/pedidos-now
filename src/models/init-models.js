var DataTypes = require("sequelize").DataTypes;
var _Address = require("./address");
var _Courier = require("./courier");
var _CourierStatus = require("./courier_status");
var _CourierStatusType = require("./courier_status_type");
var _Package = require("./package");
var _Price = require("./price");
var _Shipment = require("./shipment");
var _User = require("./user");

function initModels(sequelize) {
  var Address = _Address(sequelize, DataTypes);
  var Courier = _Courier(sequelize, DataTypes);
  var CourierStatus = _CourierStatus(sequelize, DataTypes);
  var CourierStatusType = _CourierStatusType(sequelize, DataTypes);
  var Package = _Package(sequelize, DataTypes);
  var Price = _Price(sequelize, DataTypes);
  var Shipment = _Shipment(sequelize, DataTypes);
  var User = _User(sequelize, DataTypes);

  Shipment.belongsTo(Courier, { as: "courier", foreignKey: "courierId" });
  Courier.hasMany(Shipment, { as: "shipments", foreignKey: "courierId" });

  Package.belongsTo(Shipment, { as: "idShipmentShipment", foreignKey: "idShipment" });
  Shipment.hasMany(Package, { as: "packages", foreignKey: "idShipment" });

  Address.belongsTo(User, { as: "idUserUser", foreignKey: "idUser" });
  User.hasMany(Address, { as: "addresses", foreignKey: "idUser" });

  Shipment.belongsTo(User, { as: "sender", foreignKey: "senderId" });
  User.hasMany(Shipment, { as: "shipments", foreignKey: "senderId" });

  Shipment.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
  User.hasMany(Shipment, { as: "receiverShipments", foreignKey: "receiverId" });

  CourierStatus.belongsTo(Courier, { as: "courier", foreignKey: "idCourier" });
  Courier.hasOne(CourierStatus, { as: "currentStatus", foreignKey: "idCourier" });

  CourierStatus.belongsTo(CourierStatusType, { as: "statusType", foreignKey: "idStatus" });
  CourierStatusType.hasMany(CourierStatus, { as: "courierStatuses", foreignKey: "idStatus" });

  return {
    Address,
    Courier,
    CourierStatus,
    CourierStatusType,
    Package,
    Price,
    Shipment,
    User,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;