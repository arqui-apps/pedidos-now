const { Package, Shipment } = require('../models');

const packageController = {
  async getAll(req, res) {
    try {
      const packages = await Package.findAll({
        where: { status: true },
        include: [
          {
            model: Shipment,
            as: 'idShipmentShipment'
          }
        ],
        order: [['idPackage', 'DESC']]
      });

      res.json(packages);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener paquetes',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id, {
        include: [
          {
            model: Shipment,
            as: 'idShipmentShipment'
          }
        ]
      });

      if (!packageRecord || packageRecord.status === false) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      res.json(packageRecord);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener paquete',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const idShipment = req.body.idShipment ?? req.body.id_shipment;
      const { description, size, weight, subtotal, status = true } = req.body;

      if (!idShipment) {
        return res.status(400).json({ message: 'idShipment es obligatorio' });
      }

      const newPackage = await Package.create({
        idShipment,
        description,
        size,
        weight,
        subtotal,
        status
      });

      res.status(201).json({
        message: 'Paquete creado correctamente',
        data: newPackage
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear paquete',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id);

      if (!packageRecord) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      const idShipment = req.body.idShipment ?? req.body.id_shipment ?? packageRecord.idShipment;

      await packageRecord.update({
        idShipment,
        description: req.body.description ?? packageRecord.description,
        size: req.body.size ?? packageRecord.size,
        weight: req.body.weight ?? packageRecord.weight,
        subtotal: req.body.subtotal ?? packageRecord.subtotal,
        status: req.body.status ?? packageRecord.status
      });

      res.json({
        message: 'Paquete actualizado correctamente',
        data: packageRecord
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar paquete',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id);

      if (!packageRecord) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      await packageRecord.update({ status: false });

      res.json({ message: 'Paquete eliminado lógicamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar paquete',
        error: error.message
      });
    }
  }
};

module.exports = packageController;