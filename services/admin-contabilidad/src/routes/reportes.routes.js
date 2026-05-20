const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportes.controller');

const {
    verificarToken
} = require('../middleware/auth.middleware');

// Rutas que requieren autenticación
router.get('/ventas', verificarToken, controller.getVentas);
router.get('/pedidos', verificarToken, controller.getPedidos);
router.get('/crecimiento', verificarToken, controller.getCrecimiento);
router.get('/costos', verificarToken, controller.getCostos);

router.get(
    '/pagos-fecha',
    verificarToken,
    controller.getPagosPorFecha
);

router.get(
    '/propinas',
    verificarToken,
    controller.getPropinas
);

router.get(
    '/chats',
    verificarToken,
    controller.getChats
);

router.get(
    '/usuarios',
    verificarToken,
    controller.getUsuarios
);

router.get(
    '/pedidos-externos',
    verificarToken,
    controller.getPedidosExternos
);

router.get(
    '/reembolsos-compensaciones',
    verificarToken,
    controller.getReembolsosYCompensaciones
);

router.get(
    '/estadisticas-entidad',
    verificarToken,
    controller.getEstadisticasPorEntidad
);

module.exports = router;