const express = require('express');
const router = express.Router();

// Importar rutas de módulos
const entregasRoutes = require('./entregas');
const asignacionesRoutes = require('./asignaciones');
const incidenciasRoutes = require('./incidencias');
const estadisticasRoutes = require('./estadisticas');

// Montar rutas
router.use('/entregas', entregasRoutes);
router.use('/asignaciones', asignacionesRoutes);
router.use('/incidencias', incidenciasRoutes);
router.use('/estadisticas', estadisticasRoutes);

module.exports = router;
