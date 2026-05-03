const { Shipment, Package, ShipmentTracking, User, Courier } = require('../models');

async function seedPackageData() {
  try {
    console.log('Iniciando seed de datos de paquetería...');

    // Crear usuarios de prueba
    const users = await User.bulkCreate([
      { name: 'Juan Pérez', status: true },
      { name: 'María García', status: true },
      { name: 'Carlos López', status: true }
    ], { ignoreDuplicates: true });

    // Crear repartidores de prueba
    const couriers = await Courier.bulkCreate([
      { name: 'Repartidor 1', status: true },
      { name: 'Repartidor 2', status: true }
    ], { ignoreDuplicates: true });

    // Crear envíos de prueba
    const shipments = await Shipment.bulkCreate([
      {
        senderId: 1,
        receiverId: 2,
        deliveryInstructions: 'Entregar en recepción',
        chargeType: 'standard',
        total: 75.50,
        shipmentStatus: 'pending',
        quoteData: { weight: 2.5, distance: 15 }
      },
      {
        senderId: 2,
        receiverId: 3,
        deliveryInstructions: 'Tocar timbre',
        chargeType: 'express',
        total: 120.00,
        shipmentStatus: 'assigned',
        quoteData: { weight: 5.0, distance: 25 }
      },
      {
        senderId: 3,
        receiverId: 1,
        deliveryInstructions: 'Dejar con vecino',
        chargeType: 'standard',
        total: 95.25,
        shipmentStatus: 'in_transit',
        quoteData: { weight: 3.2, distance: 20 }
      }
    ], { ignoreDuplicates: true });

    // Crear paquetes asociados
    await Package.bulkCreate([
      {
        idShipment: 1,
        description: 'Documentos importantes',
        size: 'Pequeño',
        weight: 0.5,
        subtotal: 75.50,
        status: true
      },
      {
        idShipment: 2,
        description: 'Ropa y accesorios',
        size: 'Mediano',
        weight: 2.5,
        subtotal: 120.00,
        status: true
      },
      {
        idShipment: 3,
        description: 'Electrónicos',
        size: 'Grande',
        weight: 5.0,
        subtotal: 95.25,
        status: true
      }
    ], { ignoreDuplicates: true });

    // Crear eventos de tracking
    await ShipmentTracking.bulkCreate([
      {
        idShipment: 1,
        status: 'pending',
        description: 'Envío creado, esperando asignación de repartidor'
      },
      {
        idShipment: 2,
        status: 'assigned',
        description: 'Repartidor asignado al envío'
      },
      {
        idShipment: 2,
        status: 'pending',
        description: 'Envío publicado para asignación de repartidor'
      },
      {
        idShipment: 3,
        status: 'assigned',
        description: 'Repartidor asignado al envío'
      },
      {
        idShipment: 3,
        status: 'pending',
        description: 'Envío publicado para asignación de repartidor'
      }
    ], { ignoreDuplicates: true });

    console.log('Seed de datos de paquetería completado exitosamente');
  } catch (error) {
    console.error('Error en seed de datos de paquetería:', error);
  }
}

module.exports = seedPackageData;