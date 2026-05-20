const express = require('express');
const router = express.Router();

const controller =
    require('../controllers/compensacion.controller');

const {
    verificarToken
} = require('../middleware/auth.middleware');

router.get(
    '/',
    controller.getAllCompensaciones
);

router.post(
    '/',
    verificarToken,
    controller.crearCompensacion
);

module.exports = router;