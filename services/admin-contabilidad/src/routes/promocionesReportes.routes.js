//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const {
  guardarReporte,
  obtenerReportes
} = require('../controllers/promocionesReportes.controller');

// GET /admin/promociones/reportes
router.get('/', obtenerReportes);

// POST /admin/promociones/reportes
router.post('/', guardarReporte);

module.exports = router;
