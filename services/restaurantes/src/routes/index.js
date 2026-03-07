// ============================================================
// ARCHIVO CENTRAL DE RUTAS - RESTAURANTES SERVICE
// ============================================================
// Exportación unificada de todas las rutas
// ============================================================

const express = require('express');
const router = express.Router();

// Importar rutas de módulos
const restauranteRoutes = require('./restaurantes/restaurante.routes');
const productoRoutes = require('./productos/producto.routes');

// ============================================================
// REGISTRAR RUTAS
// ============================================================

// Restaurantes
router.use('/restaurantes', restauranteRoutes);

// Productos
router.use('/productos', productoRoutes);

// ============================================================
// EXPORTAR ROUTER PRINCIPAL
// ============================================================

module.exports = router;
