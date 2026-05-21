const express = require('express');
const router = express.Router();
const controller = require('../controller/movimiento.controller');
const {validarMonto} = require('../middleware/validar');

router.get('/', controller.getAllMovimientos);
router.get('/fondos', controller.getFondos);
router.get('/fondo-reembolsos', controller.getFondoReembolsos);
router.post('/fondo-reembolsos', controller.recargarFondo);
router.post('/egreso', validarMonto, controller.egreso);
router.post('/ingreso-pedido', validarMonto, controller.ingresoPedido);

router.get('/test', (req, res) => {
    res.send('Movimiento OK');
})

module.exports = router;