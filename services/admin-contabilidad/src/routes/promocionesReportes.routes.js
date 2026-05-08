//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const {
  guardarReporte,
  obtenerReportes
} = require('../controllers/promocionesReportes.controller');

router.post('/', guardarReporte);

router.get('/', obtenerReportes);

module.exports = router;
