const { Address, User } = require('../models');

const addressController = {
  async getAll(req, res) {
    try {
      const addresses = await Address.findAll({
        include: [
          {
            model: User,
            as: 'idUserUser',
            attributes: ['idUser', 'name', 'status']
          }
        ],
        order: [['idAddress', 'DESC']]
      });

      res.json(addresses);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener direcciones',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const address = await Address.findByPk(id, {
        include: [
          {
            model: User,
            as: 'idUserUser',
            attributes: ['idUser', 'name', 'status']
          }
        ]
      });

      if (!address) {
        return res.status(404).json({ message: 'Dirección no encontrada' });
      }

      res.json(address);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener dirección',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const idUser = req.body.idUser ?? req.body.id_user;
      const { latitude, longitude, address } = req.body;

      if (!idUser) {
        return res.status(400).json({ message: 'idUser es obligatorio' });
      }

      const newAddress = await Address.create({
        idUser,
        latitude,
        longitude,
        address
      });

      res.status(201).json({
        message: 'Dirección creada correctamente',
        data: newAddress
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear dirección',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const addressRecord = await Address.findByPk(id);

      if (!addressRecord) {
        return res.status(404).json({ message: 'Dirección no encontrada' });
      }

      const idUser = req.body.idUser ?? req.body.id_user ?? addressRecord.idUser;

      await addressRecord.update({
        idUser,
        latitude: req.body.latitude ?? addressRecord.latitude,
        longitude: req.body.longitude ?? addressRecord.longitude,
        address: req.body.address ?? addressRecord.address
      });

      res.json({
        message: 'Dirección actualizada correctamente',
        data: addressRecord
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar dirección',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const address = await Address.findByPk(id);

      if (!address) {
        return res.status(404).json({ message: 'Dirección no encontrada' });
      }

      await address.destroy();

      res.json({ message: 'Dirección eliminada correctamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar dirección',
        error: error.message
      });
    }
  }
};

module.exports = addressController;