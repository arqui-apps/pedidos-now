require('dotenv').config();

const sequelize = require('../config/database');
const initModels = require('../models/init-models');

const models = initModels(sequelize);

const {
  User,
  Courier,
  Address,
  Shipment,
  Package,
  CourierStatus,
  CourierStatusType,
  Price // ✅ CORRECTO (no Prices)
} = models;

async function seed() {
  try {
    console.log('🌱 Iniciando seed...');

    // 🔥 DESACTIVAR FK
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // LIMPIAR TABLAS
    await Package.destroy({ where: {}, truncate: true });
    await Shipment.destroy({ where: {}, truncate: true });
    await Address.destroy({ where: {}, truncate: true });
    await CourierStatus.destroy({ where: {}, truncate: true });
    await Courier.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    await Price.destroy({ where: {}, truncate: true });

    // 🔥 ACTIVAR FK
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // =====================
    // USERS
    // =====================
    const users = await User.bulkCreate([
      { name: 'Juan Pérez' },
      { name: 'María López' },
      { name: 'Carlos Ruiz' },
      { name: 'Ana García' }
    ]);

    // =====================
    // COURIERS
    // =====================
    const couriers = await Courier.bulkCreate([
      { name: 'Repartidor 1' },
      { name: 'Repartidor 2' }
    ]);

    // =====================
    // PRICES
    // =====================
    await Price.bulkCreate([
      { price: 20, criteria: 'Tarifa base', status: true },
      { price: 5, criteria: 'Precio por km', status: true },
      { price: 10, criteria: 'Recargo express', status: true }
    ]);

    // =====================
    // STATUS TYPES (seguro)
    // =====================
    await CourierStatusType.bulkCreate([
      { name: 'Disponible', description: 'Puede tomar pedidos' },
      { name: 'Ocupado', description: 'Tiene pedido activo' },
      { name: 'Desconectado', description: 'No está en app' },
      { name: 'Inactivo', description: 'No trabaja' }
    ], { ignoreDuplicates: true });

    const disponible = await CourierStatusType.findOne({
      where: { name: 'Disponible' }
    });

    // =====================
    // COURIER STATUS
    // =====================
    for (let courier of couriers) {
      await CourierStatus.create({
        idCourier: courier.idCourier,
        idStatus: disponible.idStatus
      });
    }

    // =====================
    // ADDRESS
    // =====================
    await Address.bulkCreate([
      {
        idUser: users[0].idUser,
        latitude: 14.6349,
        longitude: -90.5069,
        address: 'Zona 1, Guatemala'
      },
      {
        idUser: users[1].idUser,
        latitude: 14.6249,
        longitude: -90.5169,
        address: 'Zona 10, Guatemala'
      }
    ]);

    // =====================
    // SHIPMENTS
    // =====================
    const shipments = await Shipment.bulkCreate([
      {
        deliveryInstructions: 'Tocar la puerta',
        total: 100,
        shipmentStatus: 'pending',
        chargeType: 'normal',
        senderId: users[0].idUser,
        receiverId: users[1].idUser
      },
      {
        deliveryInstructions: 'Llamar antes',
        total: 200,
        shipmentStatus: 'pending',
        chargeType: 'express',
        senderId: users[2].idUser,
        receiverId: users[3].idUser
      }
    ]);

    // =====================
    // PACKAGES
    // =====================
    for (let shipment of shipments) {
      await Package.create({
        idShipment: shipment.idShipment,
        description: 'Paquete de prueba',
        size: 'Mediano',
        weight: 2.5,
        subtotal: shipment.total
      });
    }

    console.log('Seed completado');
    process.exit();

  } catch (error) {
    console.error('Error en seed:', error);
  }
}

seed();