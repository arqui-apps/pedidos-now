const { CourierStatusType } = require('../models');

const courierStatusTypeController = {
  async getAll(req, res) {
    try {
      const records = await CourierStatusType.findAll({
        order: [['idStatus', 'ASC']]
      });

      res.json(records);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener tipos de estado',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const record = await CourierStatusType.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Tipo de estado no encontrado' });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener tipo de estado',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
      }

      const record = await CourierStatusType.create({
        name,
        description
      });

      res.status(201).json({
        message: 'Tipo de estado creado correctamente',
        data: record
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear tipo de estado',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const record = await CourierStatusType.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Tipo de estado no encontrado' });
      }

      await record.update({
        name: req.body.name ?? record.name,
        description: req.body.description ?? record.description
      });

      res.json({
        message: 'Tipo de estado actualizado correctamente',
        data: record
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar tipo de estado',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const record = await CourierStatusType.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Tipo de estado no encontrado' });
      }

      await record.destroy();

      res.json({ message: 'Tipo de estado eliminado correctamente' });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          message: 'No se puede eliminar porque está siendo usado por un repartidor'
        });
      }

      res.status(500).json({
        message: 'Error al eliminar tipo de estado',
        error: error.message
      });
    }
  }
};

module.exports = courierStatusTypeController;