const express = require('express');
const router = express.Router({ mergeParams: true });
const horarioController = require('../../controllers/restaurantes/horario.controller');

// GET /restaurantes/:restaurante_id/horarios - Obtener horarios del restaurante
router.get('/', horarioController.getByRestaurante);

// POST /restaurantes/:restaurante_id/horarios - Crear horario en el restaurante
router.post('/', horarioController.create);

// GET /restaurantes/:restaurante_id/horarios/:id - Obtener horario específico
router.get('/:id', horarioController.getById);

// PUT /restaurantes/:restaurante_id/horarios/:id - Actualizar horario
router.put('/:id', horarioController.update);

// DELETE /restaurantes/:restaurante_id/horarios/:id - Inactivar horario
router.delete('/:id', horarioController.delete);

// PATCH /restaurantes/:restaurante_id/horarios/:id/activo - Activar/desactivar
router.patch('/:id/activo', horarioController.toggleActivo);

module.exports = router;
