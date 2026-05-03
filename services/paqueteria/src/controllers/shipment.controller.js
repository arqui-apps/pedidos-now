const { Shipment, User, Courier, ShipmentTracking } = require('../models');

const shipmentController = {

  /**
   * Controlador de envíos para gestionar estado, asignación y seguimiento.
   */

  /**
   * Listar todos los envíos activos junto con remitente, receptor y repartidor.
   */
  async getAll(req, res) {
    try {
      const shipments = await Shipment.findAll({
        where: { status: true },
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' },
          { model: Courier, as: 'courier' }
        ],
        order: [['idShipment', 'DESC']]
      });

      res.json(shipments);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener envíos',
        error: error.message
      });
    }
  },

  /**
   * Obtener un envío por su ID incluyendo datos de usuario y repartidor.
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findByPk(id, {
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' },
          { model: Courier, as: 'courier' }
        ]
      });

      if (!shipment || shipment.status === false) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }

      res.json(shipment);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener envío',
        error: error.message
      });
    }
  },

  /**
   * Crear un envío nuevo y dejarlo en estado pendiente para asignación de repartidor.
   */
  async create(req, res) {
    try {
      const {
        senderId,
        receiverId,
        deliveryInstructions,
        chargeType,
        quoteData,
        total
      } = req.body;

      if (!senderId || !receiverId) {
        return res.status(400).json({
          message: 'SenderId y receiverId son obligatorios'
        });
      }

      const sender = await User.findByPk(senderId);
      if (!sender) {
        return res.status(404).json({
          message: 'Usuario sender no válido'
        });
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json({
          message: 'Usuario receiver no válido'
        });
      }

      const shipment = await Shipment.create({
        senderId,
        receiverId,
        deliveryInstructions,
        chargeType,
        quoteData,
        total,
        shipmentStatus: 'pending'
      });

      // Crear evento inicial de tracking
      await ShipmentTracking.create({
        idShipment: shipment.idShipment,
        status: 'pending',
        description: 'Envío creado y listo para asignación de repartidor'
      });

      res.status(201).json({
        message: 'Envío creado correctamente',
        data: shipment
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error al crear envío',
        error: error.message
      });
    }
  },

  /**
   * Acepta un envío pendiente y asigna un repartidor válido.
   */
  async accept(req, res) {
    try {
      const { id } = req.params;
      const { courierId } = req.body;

      const shipment = await Shipment.findByPk(id);

      if (!shipment) {
        return res.status(404).json({
          message: 'Envío no encontrado'
        });
      }

      if (shipment.shipmentStatus !== 'pending') {
        return res.status(400).json({
          message: 'El envío ya no está disponible'
        });
      }

      const courier = await Courier.findByPk(courierId);

      if (!courier) {
        return res.status(404).json({
          message: 'Repartidor no encontrado'
        });
      }

      await shipment.update({
        courierId,
        shipmentStatus: 'assigned'
      });

      // Crear evento de tracking
      await ShipmentTracking.create({
        idShipment: shipment.idShipment,
        status: 'assigned',
        description: `Repartidor ${courier.name} asignado al envío`
      });

      res.json({
        message: 'Pedido asignado exitosamente'
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error al aceptar envío',
        error: error.message
      });
    }
  },

  /**
   * Actualiza el estado del envío siguiendo transiciones válidas definidas en el proceso.
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const shipment = await Shipment.findByPk(id);

      if (!shipment) {
        return res.status(404).json({
          message: 'Envío no encontrado'
        });
      }

      const validTransitions = {
        assigned: ['in_transit'],
        in_transit: ['delivered']
      };

      const current = shipment.shipmentStatus;

      if (!validTransitions[current]?.includes(status)) {
        return res.status(400).json({
          message: `No puedes cambiar de ${current} a ${status}`
        });
      }

      await shipment.update({
        shipmentStatus: status
      });

      // Crear evento de tracking
      const statusDescriptions = {
        in_transit: 'Paquete en tránsito hacia el destino',
        delivered: 'Paquete entregado exitosamente'
      };

      await ShipmentTracking.create({
        idShipment: shipment.idShipment,
        status,
        description: statusDescriptions[status] || `Estado actualizado a ${status}`
      });

      res.json({
        message: `Estado actualizado a ${status}`
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar estado',
        error: error.message
      });
    }
  },

  /**
   * Realiza eliminación lógica del envío marcando el registro como inactivo.
   */
  async remove(req, res) {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findByPk(id);

      if (!shipment) {
        return res.status(404).json({
          message: 'Envío no encontrado'
        });
      }

      await shipment.update({ status: false });

      res.json({
        message: 'Envío eliminado lógicamente'
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar envío',
        error: error.message
      });
    }
  }

};

module.exports = shipmentController;