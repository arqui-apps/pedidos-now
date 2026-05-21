const db = require('../config/database');

const CourierStatus = db.models.CourierStatus;
const CourierStatusType = db.models.CourierStatusType;
const Courier = db.models.Courier;

/**
 * Estados válidos y transiciones permitidas
 */
const VALID_TRANSITIONS = {
  'Disponible': ['Desconectado', 'Ocupado'],
  'Ocupado': ['Disponible'],
  'Desconectado': ['Disponible'],
  'Inactivo': [] // No puede cambiar desde Inactivo
};

/**
 * Obtener el estado actual de un repartidor
 */
exports.getCurrentStatus = async (req, res) => {
  try {
    const { courierId } = req.params;

    const status = await CourierStatus.findOne({
      where: { idCourier: courierId },
      include: [{
        model: CourierStatusType,
        attributes: ['idStatus', 'name', 'description']
      }],
      attributes: ['idCourierStatus', 'changedAt', 'updatedAt']
    });

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Estado del repartidor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del repartidor',
      error: error.message
    });
  }
};

/**
 * Cambiar el estado de un repartidor
 */
exports.changeStatus = async (req, res) => {
  try {
    const { courierId } = req.params;
    const { newStatusName, reason } = req.body;

    // Validar que el repartidor existe
    const courier = await Courier.findByPk(courierId);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado'
      });
    }

    // Obtener el estado actual
    let currentStatus = await CourierStatus.findOne({
      where: { idCourier: courierId },
      include: [{
        model: CourierStatusType,
        attributes: ['idStatus', 'name']
      }]
    });

    // Si no existe registro de estado, crear uno (asumimos que inicia como Disponible)
    if (!currentStatus) {
      const defaultStatus = await CourierStatusType.findOne({
        where: { name: 'Disponible' }
      });

      currentStatus = await CourierStatus.create({
        idCourier: courierId,
        idStatus: defaultStatus.idStatus
      });

      await currentStatus.reload({
        include: [{
          model: CourierStatusType,
          attributes: ['idStatus', 'name']
        }]
      });
    }

    const currentStatusName = currentStatus.CourierStatusType.name;

    // Validar que la transición es permitida
    const allowedTransitions = VALID_TRANSITIONS[currentStatusName];

    if (!allowedTransitions.includes(newStatusName)) {
      return res.status(400).json({
        success: false,
        message: `Transición no permitida: ${currentStatusName} → ${newStatusName}`,
        currentStatus: currentStatusName,
        allowedTransitions: allowedTransitions
      });
    }

    // Obtener el ID del nuevo estado
    const newStatus = await CourierStatusType.findOne({
      where: { name: newStatusName }
    });

    if (!newStatus) {
      return res.status(404).json({
        success: false,
        message: `Estado "${newStatusName}" no existe`
      });
    }

    // Actualizar el estado
    currentStatus.idStatus = newStatus.idStatus;
    await currentStatus.save();

    // Recargar para obtener los datos actualizados
    await currentStatus.reload({
      include: [{
        model: CourierStatusType,
        attributes: ['idStatus', 'name', 'description']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: currentStatus,
      metadata: {
        previousStatus: currentStatusName,
        newStatus: newStatusName,
        reason: reason || null
      }
    });

    // TODO: Aquí iría la lógica para publicar el cambio en el broker
    // brokerService.publishCourierStatusChange({
    //   courierId,
    //   previousStatus: currentStatusName,
    //   newStatus: newStatusName,
    //   timestamp: currentStatus.updatedAt
    // });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del repartidor',
      error: error.message
    });
  }
};

/**
 * Obtener todos los estados disponibles (catálogo)
 */
exports.getAllStatusTypes = async (req, res) => {
  try {
    const statuses = await CourierStatusType.findAll({
      attributes: ['idStatus', 'name', 'description']
    });

    res.status(200).json({
      success: true,
      data: statuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de estado',
      error: error.message
    });
  }
};

/**
 * Obtener las transiciones válidas desde un estado
 */
exports.getValidTransitions = async (req, res) => {
  try {
    const { courierId } = req.params;

    const currentStatus = await CourierStatus.findOne({
      where: { idCourier: courierId },
      include: [{
        model: CourierStatusType,
        attributes: ['name']
      }]
    });

    if (!currentStatus) {
      return res.status(404).json({
        success: false,
        message: 'Estado del repartidor no encontrado'
      });
    }

    const currentStatusName = currentStatus.CourierStatusType.name;
    const validTransitions = VALID_TRANSITIONS[currentStatusName] || [];

    res.status(200).json({
      success: true,
      data: {
        currentStatus: currentStatusName,
        validTransitions: validTransitions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transiciones válidas',
      error: error.message
    });
  }
};

/**
 * Inicializar estado de un nuevo repartidor (uso interno)
 */
exports.initializeStatus = async (req, res) => {
  try {
    const { courierId, initialStatus = 'Disponible' } = req.body;

    // Validar que el repartidor existe
    const courier = await Courier.findByPk(courierId);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado'
      });
    }

    // Verificar si ya tiene estado
    const existingStatus = await CourierStatus.findOne({
      where: { idCourier: courierId }
    });

    if (existingStatus) {
      return res.status(400).json({
        success: false,
        message: 'El repartidor ya tiene un estado asignado'
      });
    }

    // Obtener el estado inicial
    const statusType = await CourierStatusType.findOne({
      where: { name: initialStatus }
    });

    if (!statusType) {
      return res.status(404).json({
        success: false,
        message: `Estado inicial "${initialStatus}" no existe`
      });
    }

    // Crear el registro de estado
    const courierStatus = await CourierStatus.create({
      idCourier: courierId,
      idStatus: statusType.idStatus
    });

    await courierStatus.reload({
      include: [{
        model: CourierStatusType,
        attributes: ['idStatus', 'name', 'description']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Estado del repartidor inicializado',
      data: courierStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al inicializar estado del repartidor',
      error: error.message
    });
  }
};
