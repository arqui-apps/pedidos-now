const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restaurantes/restaurante.controller');

// GET /api/restaurantes - Obtener todos los restaurantes
router.get('/', restauranteController.getAll);

// GET /api/restaurantes/:id - Obtener un restaurante por ID
router.get('/:id', restauranteController.getById);

// POST /api/restaurantes - Crear un nuevo restaurante
router.post('/', restauranteController.create);

// PUT /api/restaurantes/:id - Actualizar un restaurante
router.put('/:id', restauranteController.update);

// DELETE /api/restaurantes/:id - Eliminar (inactivar) un restaurante
router.delete('/:id', restauranteController.delete);

// PATCH /api/restaurantes/:id/disponibilidad - Cambiar disponibilidad
router.patch('/:id/disponibilidad', restauranteController.toggleDisponibilidad);

module.exports = router;
