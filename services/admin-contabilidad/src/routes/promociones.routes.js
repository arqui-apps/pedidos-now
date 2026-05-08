//Admin-conta Jeff. Daniel Ramos
const express = require('express');

const router = express.Router();

const {
  aplicarPromocion
} = require('../controllers/promociones.controller');

router.post('/aplicar', aplicarPromocion);

module.exports = router;
