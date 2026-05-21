const sequelize = require('../src/config/database');
const initModels = require('../src/models/init-models');

const models = initModels(sequelize);

async function test() {
  let transaction;

  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL correcta");

    // Iniciar transacción
    transaction = await sequelize.transaction();

    // Crear datos de prueba
    const user = await models.User.create(
      { name: 'Test User', status: true },
      { transaction }
    );

    const courier = await models.Courier.create(
      { name: 'Test Courier', status: true },
      { transaction }
    );

    const shipment = await models.Shipment.create(
      {
        deliveryInstructions: 'Test delivery',
        total: 100.50,
        shipmentStatus: 'pending',
        senderId: user.idUser,
        receiverId: user.idUser,
        courierId: courier.idCourier,
        status: true
      },
      { transaction }
    );

    // Consultar shipments con relaciones
    const shipments = await models.Shipment.findAll({
      limit: 5,
      include: [
        { model: models.User, as: "sender" },
        { model: models.User, as: "receiver" },
        { model: models.Courier, as: "courier" },
        { model: models.Package, as: "packages" }
      ],
      transaction
    });

    console.log(`Shipments encontrados: ${shipments.length}`);

    // Consultar usuarios
    const users = await models.User.findAll({
      limit: 5,
      include: [
        { model: models.Address, as: "addresses" },
        { model: models.Shipment, as: "shipments" },
        { model: models.Shipment, as: "receiverShipments" }
      ],
      transaction
    });

    console.log(`Users encontrados: ${users.length}`);

    // Consultar couriers
    const couriers = await models.Courier.findAll({
      limit: 5,
      include: [
        { model: models.Shipment, as: "shipments" }
      ],
      transaction
    });

    console.log(`Couriers encontrados: ${couriers.length}`);

    // Revertir cambios
    await transaction.rollback();
    console.log("Datos de prueba eliminados");

  } catch (error) {

    if (transaction) {
      await transaction.rollback();
    }

    console.error("Error al probar modelos:", error);

  } finally {

    await sequelize.close();

  }
}

test();