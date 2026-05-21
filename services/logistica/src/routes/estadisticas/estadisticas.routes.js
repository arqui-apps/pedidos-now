const express = require('express');
const router = express.Router();
const estadisticasController = require('../../controllers/estadisticas');

// GET /api/logistica/estadisticas/generales - Estadísticas generales del dashboard
router.get('/generales', estadisticasController.obtenerEstadisticasGenerales);

// GET /api/logistica/estadisticas/periodo - Resumen por periodo
router.get('/periodo', estadisticasController.obtenerResumenPorPeriodo);

// GET /api/logistica/estadisticas/repartidores - Rendimiento de repartidores
router.get('/repartidores', estadisticasController.obtenerRendimientoRepartidores);

module.exports = router;
