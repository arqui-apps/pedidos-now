/**
 * Seeder para inicializar estados de repartidores
 * Usa: node seeders/init-courier-status.js
 */

require('dotenv').config();
const sequelize = require('../src/config/database');
const initModels = require('../src/models/init-models');

const run = async () => {
  try {
    const models = initModels(sequelize);
    
    await sequelize.authenticate();
    console.log('✓ Conectado a la BD');

    // Crear transacción para asegurar consistencia
    const transaction = await sequelize.transaction();

    try {
      // 1. Insertar los tipos de estado si no existen
      const statusTypes = [
        { name: 'Disponible', description: 'Repartidor en línea y puede tomar pedidos' },
        { name: 'Ocupado', description: 'Repartidor tiene un pedido en curso' },
        { name: 'Desconectado', description: 'Repartidor no está en la aplicación' },
        { name: 'Inactivo', description: 'Repartidor ya no trabaja en la aplicación (borrado lógico)' }
      ];

      const createdStatuses = [];
      for (const statusType of statusTypes) {
        const [status] = await models.CourierStatusType.findOrCreate({
          where: { name: statusType.name },
          defaults: statusType,
          transaction
        });
        createdStatuses.push(status);
      }
      console.log('✓ Tipos de estado inicializados/verificados');

      // 2. Obtener todos los repartidores sin estado asignado
      const couriersWithoutStatus = await models.Courier.findAll({
        include: [{
          model: models.CourierStatus,
          as: 'status',
          required: false
        }],
        transaction
      });

      const couriersToInitialize = couriersWithoutStatus.filter(c => !c.status);

      // 3. Asignar estado "Disponible" a los repartidores sin estado
      if (couriersToInitialize.length > 0) {
        const availableStatus = createdStatuses.find(s => s.name === 'Disponible');
        
        for (const courier of couriersToInitialize) {
          await models.CourierStatus.create({
            idCourier: courier.idCourier,
            idStatus: availableStatus.idStatus
          }, { transaction });
        }
        console.log(`✓ ${couriersToInitialize.length} repartidor(es) inicializado(s) con estado "Disponible"`);
      } else {
        console.log('✓ Todos los repartidores ya tienen estado asignado');
      }

      await transaction.commit();
      console.log('\n✅ Seeder completado exitosamente');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error en seeder:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run();
