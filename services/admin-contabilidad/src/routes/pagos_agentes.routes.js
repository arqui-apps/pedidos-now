const express = require('express');
const router = express.Router();

const pagosController =
    require('../controllers/pagos_agentes.controller');

const {
    verificarToken
} = require('../middleware/auth.middleware');

// Aplicar validación de token a todas las rutas
router.use(verificarToken);

// POST - Crear pago a agente
router.post('/', pagosController.crearPago);

// GET - Obtener todos los pagos con filtros
router.get('/', pagosController.obtenerPagos);

// GET - Obtener pago por ID
router.get('/:id', pagosController.obtenerPagoPorId);

// GET - Obtener total de pagos en período
router.get('/total', pagosController.obtenerTotalPagos);

// GET - Obtener pagos de un agente específico
router.get(
    '/agente/:agente_id',
    pagosController.obtenerPagosPorAgente
);

module.exports = router;