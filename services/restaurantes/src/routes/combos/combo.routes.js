const express = require('express');
const router = express.Router({ mergeParams: true });
const comboController = require('../../controllers/combos/combo.controller');

// GET /restaurantes/:restaurante_id/combos - Obtener combos del restaurante
router.get('/', comboController.getByRestaurante);

// POST /restaurantes/:restaurante_id/combos - Crear combo en el restaurante
router.post('/', comboController.create);

// GET /restaurantes/:restaurante_id/combos/:id - Obtener combo específico
router.get('/:id', comboController.getById);

// PUT /restaurantes/:restaurante_id/combos/:id - Actualizar combo
router.put('/:id', comboController.update);

// DELETE /restaurantes/:restaurante_id/combos/:id - Inactivar combo
router.delete('/:id', comboController.delete);

// PATCH /restaurantes/:restaurante_id/combos/:id/activo - Activar/desactivar
router.patch('/:id/activo', comboController.toggleActivo);

// POST /restaurantes/:restaurante_id/combos/:id/productos - Agregar productos al combo
router.post('/:id/productos', comboController.addProductos);

// DELETE /restaurantes/:restaurante_id/combos/:id/productos/:producto_id - Remover producto
router.delete('/:id/productos/:producto_id', comboController.removeProducto);

module.exports = router;
