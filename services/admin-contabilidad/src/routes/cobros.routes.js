const express = require('express');
const router = express.Router();
const cobrosController = require('../controllers/cobros.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);

router.get('/', cobrosController.obtenerCobros);

router.get('/estado/banco', cobrosController.obtenerEstadoBancario);

router.get('/repartidor/:repartidor_id', cobrosController.obtenerCobrosPorRepartidor);

router.get('/saldo/:repartidor_id', cobrosController.obtenerSaldoRepartidor);

router.get('/:id', cobrosController.obtenerCobroPorId);

router.post('/', cobrosController.procesarCobro);

router.delete('/:id', cobrosController.cancelarCobro);

module.exports = router;