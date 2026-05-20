// Admin-contabilidad Emmanuel

const express = require('express');
const router = express.Router();
const reportesRestaurantesController = require('../controllers/reportesRestaurantes.controller');
const { verificarToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/reportes-restaurantes/restaurantes/resumen:
 *   get:
 *     summary: Obtener resumen general de restaurantes
 *     tags: [Reportes Restaurantes]
 *     responses:
 *       200:
 *         description: Resumen de restaurantes obtenido correctamente
 */
router.get('/restaurantes/resumen', reportesRestaurantesController.obtenerResumenRestaurantes);

/**
 * @swagger
 * /api/reportes-restaurantes/restaurantes/{entidadId}/resumen:
 *   get:
 *     summary: Obtener resumen de un restaurante por entidad
 *     tags: [Reportes Restaurantes]
 *     parameters:
 *       - in: path
 *         name: entidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entidad comercial del restaurante
 *     responses:
 *       200:
 *         description: Resumen del restaurante obtenido correctamente
 *       404:
 *         description: No se encontró resumen para el restaurante indicado
 */
router.get('/restaurantes/:entidadId/resumen', reportesRestaurantesController.obtenerResumenRestaurantePorId);

/**
 * @swagger
 * /api/reportes-restaurantes/restaurantes/cancelaciones-multas:
 *   get:
 *     summary: Obtener reporte de cancelaciones y multas de restaurantes
 *     tags: [Reportes Restaurantes]
 *     responses:
 *       200:
 *         description: Reporte de cancelaciones y multas obtenido correctamente
 */
router.get('/restaurantes/cancelaciones-multas', reportesRestaurantesController.obtenerReporteCancelacionesYMultas);


/**
 * @swagger
 * /api/reportes-restaurantes/pedido-contabilidad:
 *   post:
 *     summary: Registrar pedido de restaurante en contabilidad
 *     tags: [Reportes Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     description: Guarda un pedido proveniente del microservicio de Restaurantes en pedido_contabilidad y genera su movimiento financiero en movimiento_financiero.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurante_id
 *               - pedido_id
 *               - total
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *                 example: 5
 *               nombre_restaurante:
 *                 type: string
 *                 example: Restaurante Demo
 *               pedido_id:
 *                 type: integer
 *                 example: 8001
 *               subtotal:
 *                 type: number
 *                 example: 85.00
 *               descuento:
 *                 type: number
 *                 example: 12.00
 *               comision:
 *                 type: number
 *                 example: 8.00
 *               total:
 *                 type: number
 *                 example: 73.00
 *               estado:
 *                 type: string
 *                 example: completado
 *               descripcion:
 *                 type: string
 *                 example: Ingreso por pedido de restaurante #8001
 *               repartidor_id:
 *                 type: integer
 *                 example: 10
 *               transaction_id_banco:
 *                 type: string
 *                 example: BANK-REST-8001
 *               payment_id_cobros:
 *                 type: string
 *                 example: PAY-REST-8001
 *               idempotency_key:
 *                 type: string
 *                 example: restaurante-pedido-8001
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-18T12:00:00.000Z
 *     responses:
 *       201:
 *         description: Pedido de restaurante registrado correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post(
  '/pedido-contabilidad',
  verificarToken,
  reportesRestaurantesController.registrarPedidoContabilidadRestaurante
);


/**
 * @swagger
 * /api/reportes-restaurantes/cancelacion:
 *   post:
 *     summary: Registrar cancelación de restaurante en contabilidad
 *     tags: [Reportes Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     description: Guarda una cancelación de pedido de restaurante y, si corresponde, registra una multa por cancelación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurante_id
 *               - pedido_id
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *                 example: 5
 *               nombre_restaurante:
 *                 type: string
 *                 example: Restaurante Demo
 *               pedido_id:
 *                 type: integer
 *                 example: 8002
 *               subtotal:
 *                 type: number
 *                 example: 85.00
 *               descuento:
 *                 type: number
 *                 example: 0
 *               comision:
 *                 type: number
 *                 example: 0
 *               total:
 *                 type: number
 *                 example: 20.00
 *               monto_cancelacion:
 *                 type: number
 *                 example: 20.00
 *               multa_cancelacion:
 *                 type: number
 *                 example: 8.00
 *               estado:
 *                 type: string
 *                 example: cancelado
 *               descripcion:
 *                 type: string
 *                 example: Cancelación tardía del pedido restaurante #8002
 *               descripcion_multa:
 *                 type: string
 *                 example: Multa por cancelación tardía restaurante #8002
 *               repartidor_id:
 *                 type: integer
 *                 example: 10
 *               transaction_id_banco:
 *                 type: string
 *                 example: BANK-REST-CANCEL-8002
 *               payment_id_cobros:
 *                 type: string
 *                 example: PAY-REST-CANCEL-8002
 *               idempotency_key:
 *                 type: string
 *                 example: restaurante-cancelacion-8002
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-18T12:30:00.000Z
 *     responses:
 *       201:
 *         description: Cancelación registrada correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post(
  '/cancelacion',
  verificarToken,
  reportesRestaurantesController.registrarCancelacionRestaurante
);


/**
 * @swagger
 * /api/reportes-restaurantes/resumen-orm:
 *   get:
 *     summary: Obtener resumen financiero general de restaurantes usando ORM
 *     tags: [Reportes Restaurantes]
 *     responses:
 *       200:
 *         description: Resumen general de pedidos de restaurantes
 */
router.get('/resumen-orm', reportesRestaurantesController.obtenerResumenRestaurantesOrm);


/**
 * @swagger
 * /api/reportes-restaurantes/resumen-orm/{restauranteId}:
 *   get:
 *     summary: Obtener resumen financiero de un restaurante específico usando ORM
 *     tags: [Reportes Restaurantes]
 *     parameters:
 *       - in: path
 *         name: restauranteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID externo del restaurante
 *     responses:
 *       200:
 *         description: Resumen financiero del restaurante
 *       404:
 *         description: No se encontró información contable para este restaurante
 */
router.get('/resumen-orm/:restauranteId', reportesRestaurantesController.obtenerResumenRestaurantePorEntidad);

module.exports = router;