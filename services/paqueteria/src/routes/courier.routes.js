const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courier.controller');

router.get('/', courierController.getAll);
router.get('/:id', courierController.getById);
router.post('/', courierController.create);
router.put('/:id', courierController.update);
router.delete('/:id', courierController.remove);

module.exports = router;