const { Courier, CourierStatus, CourierStatusType } = require('../models');

async function findStatusType(body, defaultName = 'Disponible') {
  const idStatus = body.idStatus ?? body.id_status;
  const statusName = body.statusName ?? body.status_name;

  if (idStatus) {
    return await CourierStatusType.findByPk(idStatus);
  }

  if (statusName) {
    return await CourierStatusType.findOne({
      where: { name: statusName }
    });
  }

  return await CourierStatusType.findOne({
    where: { name: defaultName }
  });
}

async function setCourierCurrentStatus(idCourier, statusType) {
  if (!statusType) return;

  const currentStatus = await CourierStatus.findOne({
    where: { idCourier }
  });

  if (currentStatus) {
    await currentStatus.update({
      idStatus: statusType.idStatus,
      changedAt: new Date()
    });
  } else {
    await CourierStatus.create({
      idCourier,
      idStatus: statusType.idStatus,
      changedAt: new Date()
    });
  }
}

const courierController = {
  async getAll(req, res) {
    try {
      const couriers = await Courier.findAll({
        where: { status: true },
        include: [
          {
            model: CourierStatus,
            as: 'currentStatus',
            include: [
              {
                model: CourierStatusType,
                as: 'statusType',
                attributes: ['idStatus', 'name', 'description']
              }
            ]
          }
        ],
        order: [['idCourier', 'DESC']]
      });

      res.json(couriers);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener repartidores',
        error: error.message
      });
    }
  },

  async getAvailable(req, res) {
    try {
      const couriers = await Courier.findAll({
        where: { status: true },
        include: [
          {
            model: CourierStatus,
            as: 'currentStatus',
            required: true,
            include: [
              {
                model: CourierStatusType,
                as: 'statusType',
                required: true,
                where: { name: 'Disponible' },
                attributes: ['idStatus', 'name', 'description']
              }
            ]
          }
        ],
        order: [['idCourier', 'DESC']]
      });

      res.json(couriers);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener repartidores disponibles',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const courier = await Courier.findByPk(id, {
        include: [
          {
            model: CourierStatus,
            as: 'currentStatus',
            include: [
              {
                model: CourierStatusType,
                as: 'statusType',
                attributes: ['idStatus', 'name', 'description']
              }
            ]
          }
        ]
      });

      if (!courier || courier.status === false) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      res.json(courier);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener repartidor',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const { name, status = true } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
      }

      const newCourier = await Courier.create({
        name,
        status
      });

      const defaultStatusName = status ? 'Disponible' : 'Inactivo';
      const statusType = await findStatusType(req.body, defaultStatusName);

      await setCourierCurrentStatus(newCourier.idCourier, statusType);

      const courier = await Courier.findByPk(newCourier.idCourier, {
        include: [
          {
            model: CourierStatus,
            as: 'currentStatus',
            include: [
              {
                model: CourierStatusType,
                as: 'statusType',
                attributes: ['idStatus', 'name', 'description']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        message: 'Repartidor creado correctamente',
        data: courier
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear repartidor',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const courier = await Courier.findByPk(id);

      if (!courier) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      const newStatus = req.body.status ?? courier.status;

      await courier.update({
        name: req.body.name ?? courier.name,
        status: newStatus
      });

      if (
        req.body.idStatus !== undefined ||
        req.body.id_status !== undefined ||
        req.body.statusName !== undefined ||
        req.body.status_name !== undefined
      ) {
        const statusType = await findStatusType(req.body);
        await setCourierCurrentStatus(courier.idCourier, statusType);
      } else if (newStatus === false) {
        const inactiveStatus = await CourierStatusType.findOne({
          where: { name: 'Inactivo' }
        });
        await setCourierCurrentStatus(courier.idCourier, inactiveStatus);
      }

      const updatedCourier = await Courier.findByPk(id, {
        include: [
          {
            model: CourierStatus,
            as: 'currentStatus',
            include: [
              {
                model: CourierStatusType,
                as: 'statusType',
                attributes: ['idStatus', 'name', 'description']
              }
            ]
          }
        ]
      });

      res.json({
        message: 'Repartidor actualizado correctamente',
        data: updatedCourier
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar repartidor',
        error: error.message
      });
    }
  },

  async updateCurrentStatus(req, res) {
    try {
      const { id } = req.params;

      const courier = await Courier.findByPk(id);
      if (!courier) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      const statusType = await findStatusType(req.body);
      if (!statusType) {
        return res.status(404).json({ message: 'Tipo de estado no encontrado' });
      }

      await setCourierCurrentStatus(courier.idCourier, statusType);

      const updatedCourier = await Courier.findByPk(id, {
        include: [
          {
            model: CourierStatus,
            as: 'currentStatus',
            include: [
              {
                model: CourierStatusType,
                as: 'statusType',
                attributes: ['idStatus', 'name', 'description']
              }
            ]
          }
        ]
      });

      res.json({
        message: 'Estado del repartidor actualizado correctamente',
        data: updatedCourier
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar estado del repartidor',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const courier = await Courier.findByPk(id);

      if (!courier) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      await courier.update({ status: false });

      const inactiveStatus = await CourierStatusType.findOne({
        where: { name: 'Inactivo' }
      });

      await setCourierCurrentStatus(courier.idCourier, inactiveStatus);

      res.json({ message: 'Repartidor eliminado lógicamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar repartidor',
        error: error.message
      });
    }
  }
};

module.exports = courierController;