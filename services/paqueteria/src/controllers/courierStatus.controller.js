const { CourierStatus, Courier, CourierStatusType } = require('../models');

const courierStatusController = {
  async getAll(req, res) {
    try {
      const records = await CourierStatus.findAll({
        include: [
          {
            model: Courier,
            as: 'courier',
            attributes: ['idCourier', 'name', 'status']
          },
          {
            model: CourierStatusType,
            as: 'statusType',
            attributes: ['idStatus', 'name', 'description']
          }
        ],
        order: [['idCourierStatus', 'DESC']]
      });

      res.json(records);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener estados de repartidor',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const record = await CourierStatus.findByPk(id, {
        include: [
          {
            model: Courier,
            as: 'courier',
            attributes: ['idCourier', 'name', 'status']
          },
          {
            model: CourierStatusType,
            as: 'statusType',
            attributes: ['idStatus', 'name', 'description']
          }
        ]
      });

      if (!record) {
        return res.status(404).json({ message: 'Estado de repartidor no encontrado' });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener estado de repartidor',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const idCourier = req.body.idCourier ?? req.body.id_courier;
      const idStatus = req.body.idStatus ?? req.body.id_status;

      if (!idCourier || !idStatus) {
        return res.status(400).json({
          message: 'idCourier e idStatus son obligatorios'
        });
      }

      const courier = await Courier.findByPk(idCourier);
      if (!courier) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      const statusType = await CourierStatusType.findByPk(idStatus);
      if (!statusType) {
        return res.status(404).json({ message: 'Tipo de estado no encontrado' });
      }

      const exists = await CourierStatus.findOne({
        where: { idCourier }
      });

      if (exists) {
        return res.status(409).json({
          message: 'Ese repartidor ya tiene un estado actual registrado'
        });
      }

      const record = await CourierStatus.create({
        idCourier,
        idStatus,
        changedAt: new Date()
      });

      res.status(201).json({
        message: 'Estado de repartidor creado correctamente',
        data: record
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear estado de repartidor',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const record = await CourierStatus.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Estado de repartidor no encontrado' });
      }

      const idCourier = req.body.idCourier ?? req.body.id_courier ?? record.idCourier;
      const idStatus = req.body.idStatus ?? req.body.id_status ?? record.idStatus;

      const courier = await Courier.findByPk(idCourier);
      if (!courier) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      const statusType = await CourierStatusType.findByPk(idStatus);
      if (!statusType) {
        return res.status(404).json({ message: 'Tipo de estado no encontrado' });
      }

      await record.update({
        idCourier,
        idStatus,
        changedAt: new Date()
      });

      res.json({
        message: 'Estado de repartidor actualizado correctamente',
        data: record
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar estado de repartidor',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const record = await CourierStatus.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Estado de repartidor no encontrado' });
      }

      await record.destroy();

      res.json({ message: 'Estado de repartidor eliminado correctamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar estado de repartidor',
        error: error.message
      });
    }
  }
};

module.exports = courierStatusController;