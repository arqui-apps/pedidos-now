const express = require('express');
const router = express.Router();
const productoController = require('../../controllers/productos/producto.controller');

// GET /api/productos - Obtener todos los productos
router.get('/', productoController.getAll);

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', productoController.getById);

// GET /api/productos/restaurante/:restaurante_id - Obtener productos por restaurante
router.get('/restaurante/:restaurante_id', productoController.getByRestaurante);

// POST /api/productos - Crear un nuevo producto
router.post('/', productoController.create);

// PUT /api/productos/:id - Actualizar un producto
router.put('/:id', productoController.update);

// DELETE /api/productos/:id - Eliminar (inactivar) un producto
router.delete('/:id', productoController.delete);

// PATCH /api/productos/:id/activo - Activar/desactivar un producto
router.patch('/:id/activo', productoController.toggleActivo);

module.exports = router;
