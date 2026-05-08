//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const promocionesController = require('../controllers/promociones.controller');

router.post(
  '/validar',
  promocionesController.validarPromociones
);

module.exports = router;
