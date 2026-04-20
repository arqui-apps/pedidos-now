const { Shipment, User, Courier } = require('../models');

const shipmentController = {

  //  Obtener todos
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

  //  Obtener por ID
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

  //  Crear envío
  async create(req, res) {
    try {
      const {
        senderId,
        receiverId,
        deliveryInstructions,
        chargeType
      } = req.body;

      if (!senderId || !receiverId) {
        return res.status(400).json({
          message: 'Sender y Receiver son obligatorios'
        });
      }

      const sender = await User.findByPk(senderId);
      const receiver = await User.findByPk(receiverId);

      if (!sender || !receiver) {
        return res.status(404).json({
          message: 'Usuarios no válidos'
        });
      }

      const shipment = await Shipment.create({
        senderId,
        receiverId,
        deliveryInstructions,
        chargeType,
        shipmentStatus: 'pending'
      });

      // Cancelación automática en 5 minutos
      setTimeout(async () => {
        try {
          const current = await Shipment.findByPk(shipment.idShipment);

          if (current && current.shipmentStatus === 'pending') {
            await current.update({ shipmentStatus: 'cancelled' });
            console.log(`Shipment ${shipment.idShipment} cancelado por timeout`);
          }
        } catch (err) {
          console.error('Error en cancelación automática:', err.message);
        }
      }, 5 * 60 * 1000);

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

  //  Aceptar envío (asignar repartidor)
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

  // 🔹 Cambiar estado
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

  // 🔹 Eliminar lógico
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