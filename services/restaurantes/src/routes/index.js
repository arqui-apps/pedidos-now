// ============================================================
// ARCHIVO CENTRAL DE RUTAS - RESTAURANTES SERVICE
// ============================================================
// Exportación unificada de todas las rutas
// ============================================================

const express = require('express');
const router = express.Router();

// Importar rutas de módulos
const restauranteRoutes = require('./restaurantes/restaurante.routes');

// ============================================================
// REGISTRAR RUTAS
// ============================================================

// Restaurantes
router.use('/restaurantes', restauranteRoutes);

// ============================================================
// EXPORTAR ROUTER PRINCIPAL
// ============================================================

module.exports = router;
