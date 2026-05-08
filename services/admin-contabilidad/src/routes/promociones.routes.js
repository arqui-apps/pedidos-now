//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const promocionesController = require('../controller/promociones.controller');

router.post(
  '/validar',
  promocionesController.validarPromociones
);

module.exports = router;
