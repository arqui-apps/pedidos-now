const { Shipment, Courier, User, Package } = require('../models');

const shipmentController = {
  async getAll(req, res) {
    try {
      const shipments = await Shipment.findAll({
        where: { status: true },
        include: [
          {
            model: Courier,
            as: 'courier',
            attributes: ['idCourier', 'name', 'status']
          },
          {
            model: User,
            as: 'sender',
            attributes: ['idUser', 'name', 'status']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['idUser', 'name', 'status']
          }
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

  async getById(req, res) {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findByPk(id, {
        include: [
          {
            model: Courier,
            as: 'courier',
            attributes: ['idCourier', 'name', 'status']
          },
          {
            model: User,
            as: 'sender',
            attributes: ['idUser', 'name', 'status']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['idUser', 'name', 'status']
          },
          {
            model: Package,
            as: 'packages'
          }
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

  async create(req, res) {
    try {
      const deliveryInstructions =
        req.body.deliveryInstructions ?? req.body.delivery_instructions;

      const shipmentStatus =
        req.body.shipmentStatus ?? req.body.shipment_status ?? 'pending';

      const chargeType =
        req.body.chargeType ?? req.body.charge_type;

      const estimatedDeliveryTime =
        req.body.estimatedDeliveryTime ?? req.body.estimated_delivery_time;

      const senderId =
        req.body.senderId ?? req.body.sender_id;

      const receiverId =
        req.body.receiverId ?? req.body.receiver_id;

      const courierId =
        req.body.courierId ?? req.body.courier_id ?? null;

      const invoiceSeries =
        req.body.invoiceSeries ?? req.body.invoice_series;

      const total = req.body.total;
      const status = req.body.status ?? true;

      if (!senderId || !receiverId) {
        return res.status(400).json({
          message: 'senderId y receiverId son obligatorios'
        });
      }

      const newShipment = await Shipment.create({
        deliveryInstructions,
        total,
        shipmentStatus,
        chargeType,
        estimatedDeliveryTime,
        senderId,
        receiverId,
        courierId,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceSeries,
        status
      });

      res.status(201).json({
        message: 'Envío creado correctamente',
        data: newShipment
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear envío',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findByPk(id);

      if (!shipment) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }

      const deliveryInstructions =
        req.body.deliveryInstructions ?? req.body.delivery_instructions ?? shipment.deliveryInstructions;

      const shipmentStatus =
        req.body.shipmentStatus ?? req.body.shipment_status ?? shipment.shipmentStatus;

      const chargeType =
        req.body.chargeType ?? req.body.charge_type ?? shipment.chargeType;

      const estimatedDeliveryTime =
        req.body.estimatedDeliveryTime ?? req.body.estimated_delivery_time ?? shipment.estimatedDeliveryTime;

      const senderId =
        req.body.senderId ?? req.body.sender_id ?? shipment.senderId;

      const receiverId =
        req.body.receiverId ?? req.body.receiver_id ?? shipment.receiverId;

      const courierId =
        req.body.courierId ?? req.body.courier_id ?? shipment.courierId;

      const invoiceSeries =
        req.body.invoiceSeries ?? req.body.invoice_series ?? shipment.invoiceSeries;

      await shipment.update({
        deliveryInstructions,
        total: req.body.total ?? shipment.total,
        shipmentStatus,
        chargeType,
        estimatedDeliveryTime,
        senderId,
        receiverId,
        courierId,
        updatedAt: new Date(),
        invoiceSeries,
        status: req.body.status ?? shipment.status
      });

      res.json({
        message: 'Envío actualizado correctamente',
        data: shipment
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar envío',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findByPk(id);

      if (!shipment) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }

      await shipment.update({
        status: false,
        updatedAt: new Date()
      });

      res.json({ message: 'Envío eliminado lógicamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar envío',
        error: error.message
      });
    }
  }
};

module.exports = shipmentController;