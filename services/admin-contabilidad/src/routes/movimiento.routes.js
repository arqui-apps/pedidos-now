const express = require('express');
const router = express.Router();

const movimientoController =
    require('../controllers/movimiento.controller');

const {
    verificarToken
} = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/movimientos/test:
 *   get:
 *     summary: Probar que las rutas de movimientos funcionan
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Ruta de prueba funcionando
 */
router.get('/test', (req, res) => {
    res.json({
        ok: true,
        message: 'Movimiento OK'
    });
});

// Aplicar auth global
router.use(verificarToken);

/**
 * @swagger
 * /api/movimientos:
 *   get:
 *     summary: Obtener todos los movimientos financieros
 *     tags: [Movimientos]
 */
router.get(
    '/',
    movimientoController.obtenerMovimientos
);

/**
 * @swagger
 * /api/movimientos/{id}:
 *   get:
 *     summary: Obtener movimiento financiero por ID
 *     tags: [Movimientos]
 */
router.get(
    '/:id',
    movimientoController.getMovimientoById
);

// ===== CRUD GENERAL =====
router.post(
    '/',
    movimientoController.crearMovimiento
);

router.put(
    '/:id',
    movimientoController.updateMovimiento
);

router.delete(
    '/:id',
    movimientoController.deleteMovimiento
);

// ===== TUS ENDPOINTS ORIGINALES =====

router.get(
    '/saldo/:cuenta_id',
    movimientoController.obtenerSaldo
);

router.get(
    '/periodo',
    movimientoController.obtenerMovimientosPorPeriodo
);

router.get(
    '/estadisticas',
    movimientoController.obtenerEstadisticas
);

module.exports = router;