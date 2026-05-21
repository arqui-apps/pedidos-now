// ============================================================
// ARCHIVO CENTRAL DE RUTAS - RESTAURANTES SERVICE
// ============================================================
// Exportación unificada de todas las rutas
// ============================================================

const express = require('express');
const router = express.Router();

// Importar rutas principales
const restauranteRoutes = require('./restaurantes/restaurante.routes');
const estadoPedidoRoutes = require('./pedidos/estado-pedido.routes');

// ============================================================
// REGISTRAR RUTAS
// ============================================================

// Rutas de estados (catálogo global)
router.use('/estados-pedido', estadoPedidoRoutes);

// Rutas de restaurantes (incluye todas las subrutas anidadas)
router.use('/restaurantes', restauranteRoutes);

// ============================================================
// EXPORTAR ROUTER PRINCIPAL
// ============================================================

module.exports = router;
