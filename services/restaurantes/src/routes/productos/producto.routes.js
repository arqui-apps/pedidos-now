const express = require('express');
const router = express.Router({ mergeParams: true });
const productoController = require('../../controllers/productos/producto.controller');

// Importar subrutas
const precioRoutes = require('../precios/precio.routes');

// GET /restaurantes/:restaurante_id/productos - Obtener productos del restaurante
router.get('/', productoController.getByRestaurante);

// POST /restaurantes/:restaurante_id/productos - Crear producto en el restaurante
router.post('/', productoController.create);

// GET /restaurantes/:restaurante_id/productos/:id - Obtener producto específico
router.get('/:id', productoController.getById);

// PUT /restaurantes/:restaurante_id/productos/:id - Actualizar producto
router.put('/:id', productoController.update);

// DELETE /restaurantes/:restaurante_id/productos/:id - Inactivar producto
router.delete('/:id', productoController.delete);

// PATCH /restaurantes/:restaurante_id/productos/:id/activo - Activar/desactivar
router.patch('/:id/activo', productoController.toggleActivo);

// Subrutas de precios: /restaurantes/:restaurante_id/productos/:producto_id/precio/*
router.use('/:producto_id/precio', precioRoutes);

module.exports = router;
