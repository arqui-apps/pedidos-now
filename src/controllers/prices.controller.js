const { Price } = require('../models');

const pricesController = {
  async getAll(req, res) {
    try {
      const prices = await Price.findAll({
        where: { status: true },
        order: [['idPrice', 'DESC']]
      });

      res.json(prices);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener precios',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const price = await Price.findByPk(id);

      if (!price || price.status === false) {
        return res.status(404).json({ message: 'Precio no encontrado' });
      }

      res.json(price);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener precio',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const { price, criteria, status = true } = req.body;

      const newPrice = await Price.create({
        price,
        criteria,
        status
      });

      res.status(201).json({
        message: 'Precio creado correctamente',
        data: newPrice
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear precio',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const priceRecord = await Price.findByPk(id);

      if (!priceRecord) {
        return res.status(404).json({ message: 'Precio no encontrado' });
      }

      await priceRecord.update({
        price: req.body.price ?? priceRecord.price,
        criteria: req.body.criteria ?? priceRecord.criteria,
        status: req.body.status ?? priceRecord.status
      });

      res.json({
        message: 'Precio actualizado correctamente',
        data: priceRecord
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar precio',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const price = await Price.findByPk(id);

      if (!price) {
        return res.status(404).json({ message: 'Precio no encontrado' });
      }

      await price.update({ status: false });

      res.json({ message: 'Precio eliminado lógicamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar precio',
        error: error.message
      });
    }
  }
};

module.exports = pricesController;