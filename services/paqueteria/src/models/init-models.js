var DataTypes = require("sequelize").DataTypes;
var _Address = require("./address");
var _Courier = require("./courier");
var _Package = require("./package");
var _Price = require("./price");
var _Shipment = require("./shipment");
var _User = require("./user");
var _CourierStatusType = require("./courier_status_type");
var _CourierStatus = require("./courier_status");

function initModels(sequelize) {
  var Address = _Address(sequelize, DataTypes);
  var Courier = _Courier(sequelize, DataTypes);
  var Package = _Package(sequelize, DataTypes);
  var Price = _Price(sequelize, DataTypes);
  var Shipment = _Shipment(sequelize, DataTypes);
  var User = _User(sequelize, DataTypes);
  var CourierStatusType = _CourierStatusType(sequelize, DataTypes);
  var CourierStatus = _CourierStatus(sequelize, DataTypes);

  Shipment.belongsTo(Courier, { as: "courier", foreignKey: "courierId"});
  Courier.hasMany(Shipment, { as: "shipments", foreignKey: "courierId"});
  Package.belongsTo(Shipment, { as: "idShipmentShipment", foreignKey: "idShipment"});
  Shipment.hasMany(Package, { as: "packages", foreignKey: "idShipment"});
  Address.belongsTo(User, { as: "idUserUser", foreignKey: "idUser"});
  User.hasMany(Address, { as: "addresses", foreignKey: "idUser"});
  Shipment.belongsTo(User, { as: "sender", foreignKey: "senderId"});
  User.hasMany(Shipment, { as: "shipments", foreignKey: "senderId"});
  Shipment.belongsTo(User, { as: "receiver", foreignKey: "receiverId"});
  User.hasMany(Shipment, { as: "receiverShipments", foreignKey: "receiverId"});

  // Relaciones de estado de repartidor
  CourierStatus.belongsTo(Courier, { as: "courier", foreignKey: "idCourier"});
  Courier.hasOne(CourierStatus, { as: "status", foreignKey: "idCourier"});
  CourierStatus.belongsTo(CourierStatusType, { as: "CourierStatusType", foreignKey: "idStatus"});
  CourierStatusType.hasMany(CourierStatus, { as: "courierStatuses", foreignKey: "idStatus"});

  return {
    Address,
    Courier,
    Package,
    Price,
    Shipment,
    User,
    CourierStatusType,
    CourierStatus,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
