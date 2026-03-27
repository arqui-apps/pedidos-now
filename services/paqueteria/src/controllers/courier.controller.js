const { Courier } = require('../models');

const courierController = {
  async getAll(req, res) {
    try {
      const couriers = await Courier.findAll({
        where: { status: true },
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

  async getById(req, res) {
    try {
      const { id } = req.params;

      const courier = await Courier.findByPk(id);

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

      res.status(201).json({
        message: 'Repartidor creado correctamente',
        data: newCourier
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
      const { name, status } = req.body;

      const courier = await Courier.findByPk(id);

      if (!courier) {
        return res.status(404).json({ message: 'Repartidor no encontrado' });
      }

      await courier.update({
        name: name ?? courier.name,
        status: status ?? courier.status
      });

      res.json({
        message: 'Repartidor actualizado correctamente',
        data: courier
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar repartidor',
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