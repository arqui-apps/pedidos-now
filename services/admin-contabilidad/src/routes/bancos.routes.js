const express = require('express');
const router = express.Router();

const bancosController = require('../controllers/bancos.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);

router.get(
    '/cuentas',
    bancosController.obtenerCuentas
);

router.get(
    '/saldo/:account_number',
    bancosController.consultarSaldo
);

router.get(
    '/estado',
    bancosController.verificarBanco
);

module.exports = router;