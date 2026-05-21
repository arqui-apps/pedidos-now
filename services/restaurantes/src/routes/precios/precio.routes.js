const express = require('express');
const router = express.Router({ mergeParams: true });
const precioController = require('../../controllers/precios/precio.controller');

// GET /restaurantes/:restaurante_id/productos/:producto_id/precio/actual - Precio actual
router.get('/actual', precioController.getPrecioActual);

// GET /restaurantes/:restaurante_id/productos/:producto_id/precio/historial - Historial
router.get('/historial', precioController.getHistorialByProducto);

// GET /restaurantes/:restaurante_id/productos/:producto_id/precio/comparar - Comparar
router.get('/comparar', precioController.compararPrecios);

// PUT /restaurantes/:restaurante_id/productos/:producto_id/precio - Actualizar precio
router.put('/', precioController.actualizarPrecio);

module.exports = router;
