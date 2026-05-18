const express = require('express');
const router = express.Router();
const entregasController = require('../../controllers/entregas');

// POST /api/logistica/entregas - Crear nueva entrega
router.post('/', entregasController.crearEntrega);

// POST /api/logistica/entregas/restaurantes/:restaurante_id/pedidos/:pedido_id - Crear desde Restaurante
router.post('/restaurantes/:restaurante_id/pedidos/:pedido_id', entregasController.crearEntregaDesdeRestaurante);

// GET /api/logistica/entregas - Listar entregas con filtros
router.get('/', entregasController.obtenerEntregas);

// PATCH /api/logistica/entregas/:id/estado - Cambiar estado de entrega
router.patch('/:id/estado', entregasController.cambiarEstadoEntrega);

// PATCH /api/logistica/entregas/:id/cancelar - Cancelar entrega
router.patch('/:id/cancelar', entregasController.cancelarEntrega);

// PATCH /api/logistica/entregas/:id/recogida - Marcar entrega recogida
router.patch('/:id/recogida', entregasController.marcarRecogida);

// PATCH /api/logistica/entregas/:id/entregada - Marcar entrega completada
router.patch('/:id/entregada', entregasController.marcarEntregada);

// GET /api/logistica/entregas/:id/historial - Obtener historial de estados
router.get('/:id/historial', entregasController.obtenerHistorialEntrega);

// GET /api/logistica/entregas/:id/detalles - Obtener detalle completo
router.get('/:id/detalles', entregasController.obtenerDetallesCompletos);

// GET /api/logistica/entregas/origen/:origen_id - Buscar entregas por ID de origen (pedido)
router.get('/origen/:origen_id', entregasController.obtenerEntregasPorOrigen);

// GET /api/logistica/entregas/:id - Obtener entrega por ID
router.get('/:id', entregasController.obtenerEntregaPorId);

// PUT /api/logistica/entregas/:id - Actualizar entrega
router.put('/:id', entregasController.actualizarEntrega);

module.exports = router;
