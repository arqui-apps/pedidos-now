const express = require('express');
const router = express.Router();
const entregasController = require('../../controllers/entregas');

// POST /api/logistica/entregas - Crear nueva entrega
router.post('/', entregasController.crearEntrega);

// GET /api/logistica/entregas - Listar entregas con filtros
router.get('/', entregasController.obtenerEntregas);

// GET /api/logistica/entregas/:id - Obtener entrega por ID
router.get('/:id', entregasController.obtenerEntregaPorId);

// PUT /api/logistica/entregas/:id - Actualizar entrega
router.put('/:id', entregasController.actualizarEntrega);

// PATCH /api/logistica/entregas/:id/estado - Cambiar estado de entrega
router.patch('/:id/estado', entregasController.cambiarEstadoEntrega);

// PATCH /api/logistica/entregas/:id/cancelar - Cancelar entrega
router.patch('/:id/cancelar', entregasController.cancelarEntrega);

// GET /api/logistica/entregas/:id/historial - Obtener historial de estados
router.get('/:id/historial', entregasController.obtenerHistorialEntrega);

module.exports = router;
