const express = require('express');
const router = express.Router();
const asignacionesController = require('../../controllers/asignaciones');

// POST /api/logistica/asignaciones - Asignar repartidor a entrega
router.post('/', asignacionesController.asignarRepartidor);

// PUT /api/logistica/asignaciones/entrega/:id - Reasignar repartidor
router.put('/entrega/:id', asignacionesController.reasignarRepartidor);

// GET /api/logistica/asignaciones/entrega/:id - Obtener asignación activa de entrega
router.get('/entrega/:id', asignacionesController.obtenerAsignacionActiva);

// GET /api/logistica/asignaciones/entrega/:id/historial - Historial de asignaciones de entrega
router.get('/entrega/:id/historial', asignacionesController.obtenerHistorialAsignaciones);

// GET /api/logistica/asignaciones/repartidor/:repartidor_id - Entregas de un repartidor
router.get('/repartidor/:repartidor_id', asignacionesController.obtenerEntregasPorRepartidor);

// DELETE /api/logistica/asignaciones/entrega/:id - Desasignar repartidor de entrega
router.delete('/entrega/:id', asignacionesController.desasignarRepartidor);

module.exports = router;
