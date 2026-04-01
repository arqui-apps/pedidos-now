const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courier.controller');

router.get('/available', courierController.getAvailable);
router.get('/:id', courierController.getById);
router.get('/', courierController.getAll);
router.post('/', courierController.create);
router.put('/:id/status', courierController.updateCurrentStatus);
router.put('/:id', courierController.update);
router.delete('/:id', courierController.remove);

module.exports = router;