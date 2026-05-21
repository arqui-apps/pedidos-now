const express = require('express');
const router = express.Router();
const incidenciasController = require('../../controllers/incidencias');

// POST /api/logistica/incidencias - Crear incidencia
router.post('/', incidenciasController.crearIncidencia);

// GET /api/logistica/incidencias - Listar incidencias con filtros
router.get('/', incidenciasController.obtenerIncidencias);

// GET /api/logistica/incidencias/:id - Obtener incidencia por ID
router.get('/:id', incidenciasController.obtenerIncidenciaPorId);

// GET /api/logistica/incidencias/entrega/:id - Incidencias de una entrega
router.get('/entrega/:id', incidenciasController.obtenerIncidenciasPorEntrega);

// GET /api/logistica/incidencias/repartidor/:repartidor_id - Incidencias de un repartidor
router.get('/repartidor/:repartidor_id', incidenciasController.obtenerIncidenciasPorRepartidor);

// PUT /api/logistica/incidencias/:id - Actualizar incidencia
router.put('/:id', incidenciasController.actualizarIncidencia);

// PATCH /api/logistica/incidencias/:id/resolver - Marcar incidencia como resuelta
router.patch('/:id/resolver', incidenciasController.resolverIncidencia);

// PATCH /api/logistica/incidencias/:id/reabrir - Reabrir incidencia
router.patch('/:id/reabrir', incidenciasController.reabrirIncidencia);

// GET /api/logistica/incidencias/estadisticas - Estadísticas de incidencias
router.get('/stats/estadisticas', incidenciasController.obtenerEstadisticasIncidencias);

module.exports = router;
