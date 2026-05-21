const express = require('express');
const router = express.Router({ mergeParams: true });
const pedidoCtrl = require('../../controllers/pedidos/pedido.controller');

// Subrutas anidadas
const detalleRoutes = require('./detalle-pedido.routes');
const historialRoutes = require('./historial-estados-pedido.routes');
const cancelacionRoutes = require('./cancelacion-pedido.routes');

// GET /restaurantes/:restaurante_id/pedidos - Obtener pedidos del restaurante
router.get('/', pedidoCtrl.getAll);

// POST /restaurantes/:restaurante_id/pedidos - Crear pedido en el restaurante
router.post('/', pedidoCtrl.create);

// GET /restaurantes/:restaurante_id/pedidos/:id - Obtener pedido específico
router.get('/:id', pedidoCtrl.getById);

// PUT /restaurantes/:restaurante_id/pedidos/:id - Actualizar pedido
router.put('/:id', pedidoCtrl.update);

// PUT /restaurantes/:restaurante_id/pedidos/:id/estado - Cambiar estado del pedido
router.put('/:id/estado', pedidoCtrl.cambiarEstado);

// Subrutas anidadas bajo /:id
router.use('/:pedido_id/detalles', detalleRoutes);
router.use('/:pedido_id/historial', historialRoutes);
router.use('/:pedido_id/cancelacion', cancelacionRoutes);

module.exports = router;
