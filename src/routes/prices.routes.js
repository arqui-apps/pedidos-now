const express = require('express');
const router = express.Router();
const pricesController = require('../controllers/prices.controller');

router.get('/', pricesController.getAll);
router.get('/:id', pricesController.getById);
router.post('/', pricesController.create);
router.put('/:id', pricesController.update);
router.delete('/:id', pricesController.remove);

module.exports = router;