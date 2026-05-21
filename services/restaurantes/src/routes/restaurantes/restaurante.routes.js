const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restaurantes/restaurante.controller');

// Importar subrutas
const horarioRoutes = require('./horario.routes');
const productoRoutes = require('../productos/producto.routes');
const comboRoutes = require('../combos/combo.routes');
const pedidoRoutes = require('../pedidos/pedido.routes');
const precioRoutes = require('../precios/precio.routes');

// ============================================================
// RUTAS DE RESTAURANTES (nivel base)
// ============================================================

// GET /restaurantes - Obtener todos los restaurantes
router.get('/', restauranteController.getAll);

// POST /restaurantes - Crear un nuevo restaurante
router.post('/', restauranteController.create);

// GET /restaurantes/:id - Obtener un restaurante por ID
router.get('/:id', restauranteController.getById);

// PUT /restaurantes/:id - Actualizar un restaurante
router.put('/:id', restauranteController.update);

// DELETE /restaurantes/:id - Inactivar un restaurante
router.delete('/:id', restauranteController.delete);

// PATCH /restaurantes/:id/disponibilidad - Cambiar disponibilidad
router.patch('/:id/disponibilidad', restauranteController.toggleDisponibilidad);

// ============================================================
// SUBRUTAS ANIDADAS (recursos del restaurante)
// ============================================================

// /restaurantes/:restaurante_id/horarios
router.use('/:restaurante_id/horarios', horarioRoutes);

// /restaurantes/:restaurante_id/productos
router.use('/:restaurante_id/productos', productoRoutes);

// /restaurantes/:restaurante_id/combos
router.use('/:restaurante_id/combos', comboRoutes);

// /restaurantes/:restaurante_id/pedidos
router.use('/:restaurante_id/pedidos', pedidoRoutes);

module.exports = router;
