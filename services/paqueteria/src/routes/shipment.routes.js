const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment.controller');

router.get('/', shipmentController.getAll);
router.get('/:id', shipmentController.getById);
router.post('/', shipmentController.create);
router.put('/:id', shipmentController.update);
router.delete('/:id', shipmentController.remove);

module.exports = router;