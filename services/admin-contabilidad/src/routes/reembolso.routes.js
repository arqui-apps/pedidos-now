const express = require('express');
const router = express.Router();

const reembolsoController =
    require('../controllers/reembolso.controller');

const {
    verificarToken
} = require('../middleware/auth.middleware');

// Aplicar validación de token a todas las rutas
router.use(verificarToken);

// POST - Crear reembolso
router.post('/', reembolsoController.crearReembolso);

// GET - Obtener todos los reembolsos con filtros
router.get('/', reembolsoController.obtenerReembolsos);

// GET - Obtener reembolso por ID
router.get('/:id', reembolsoController.obtenerReembolsoPorId);

// PUT - Procesar (aprobar) reembolso
router.put('/:id/procesar', reembolsoController.procesarReembolso);

// PUT - Rechazar reembolso
router.put('/:id/rechazar', reembolsoController.rechazarReembolso);

// GET - Obtener total de reembolsos
router.get('/total', reembolsoController.obtenerTotalReembolsos);

module.exports = router;