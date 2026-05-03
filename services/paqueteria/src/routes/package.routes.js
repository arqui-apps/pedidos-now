const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');

router.get('/', packageController.getAll);
router.get('/:id', packageController.getById);
router.post('/', packageController.create);
router.put('/:id', packageController.update);
router.delete('/:id', packageController.remove);

// Nuevos endpoints para UI de clientes
router.post('/quote', packageController.quote);
router.get('/customers/me', packageController.getCustomerPackages);
router.post('/:id/cancel', packageController.cancel);
router.get('/:id/tracking', packageController.getTracking);

module.exports = router;