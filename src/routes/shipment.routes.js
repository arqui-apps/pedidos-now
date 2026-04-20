const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment.controller');

//  CRUD básico
router.get('/', shipmentController.getAll);
router.get('/:id', shipmentController.getById);
router.post('/', shipmentController.create);
router.delete('/:id', shipmentController.remove);

//  Flujo del negocio
router.patch('/:id/accept', shipmentController.accept);
router.patch('/:id/status', shipmentController.updateStatus);

module.exports = router;

