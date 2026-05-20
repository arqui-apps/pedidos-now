// Admin-contabilidad Kenneth

const express = require('express');
const router = express.Router();

const controller = require('../controllers/reportesPaqueteria.controller');
const { verificarToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/reportes-paqueteria/health:
 *   get:
 *     summary: Verificar conexión con el microservicio de Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Conexión exitosa con Paquetería
 *       500:
 *         description: Error de conexión con Paquetería
 */
router.get('/health', controller.healthPaqueteria);

/**
 * @swagger
 * /api/reportes-paqueteria/shipments:
 *   get:
 *     summary: Listar envíos desde el microservicio de Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Lista de envíos
 */
router.get('/shipments', controller.listarEnvios);

/**
 * @swagger
 * /api/reportes-paqueteria/shipments/{shipmentId}:
 *   get:
 *     summary: Obtener envío de Paquetería por ID
 *     tags: [Reportes Paquetería]
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del envío
 *     responses:
 *       200:
 *         description: Detalle del envío
 */
router.get('/shipments/:shipmentId', controller.obtenerEnvioPorId);

/**
 * @swagger
 * /api/reportes-paqueteria/packages:
 *   get:
 *     summary: Listar paquetes desde el microservicio de Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Lista de paquetes
 */
router.get('/packages', controller.listarPaquetes);

/**
 * @swagger
 * /api/reportes-paqueteria/packages/{packageId}:
 *   get:
 *     summary: Obtener paquete de Paquetería por ID
 *     tags: [Reportes Paquetería]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paquete
 *     responses:
 *       200:
 *         description: Detalle del paquete
 */
router.get('/packages/:packageId', controller.obtenerPaquetePorId);

/**
 * @swagger
 * /api/reportes-paqueteria/packages/{packageId}/tracking:
 *   get:
 *     summary: Obtener tracking de un paquete
 *     tags: [Reportes Paquetería]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paquete
 *       - in: header
 *         name: x-customer-token
 *         required: false
 *         schema:
 *           type: string
 *         description: Token del cliente si el servicio externo lo requiere
 *     responses:
 *       200:
 *         description: Historial de tracking del paquete
 */
router.get('/packages/:packageId/tracking', controller.obtenerTrackingPaquete);

/**
 * @swagger
 * /api/reportes-paqueteria/couriers:
 *   get:
 *     summary: Listar repartidores desde el microservicio de Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Lista de repartidores
 */
router.get('/couriers', controller.listarRepartidores);

/**
 * @swagger
 * /api/reportes-paqueteria/couriers/available:
 *   get:
 *     summary: Listar repartidores disponibles desde Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Lista de repartidores disponibles
 */
router.get('/couriers/available', controller.listarRepartidoresDisponibles);

/**
 * @swagger
 * /api/reportes-paqueteria/prices:
 *   get:
 *     summary: Listar precios o tarifas desde Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Lista de precios
 */
router.get('/prices', controller.listarPrecios);

/**
 * @swagger
 * /api/reportes-paqueteria/quote:
 *   post:
 *     summary: Cotizar paquete usando el microservicio de Paquetería
 *     tags: [Reportes Paquetería]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: integer
 *                 example: 1
 *               receiverId:
 *                 type: integer
 *                 example: 2
 *               packageDetails:
 *                 type: object
 *                 example:
 *                   weight: 2.5
 *                   dimensions: 30x20x10
 *               originAddress:
 *                 type: object
 *                 example:
 *                   street: Zona 1
 *                   city: Guatemala
 *               destinationAddress:
 *                 type: object
 *                 example:
 *                   street: Zona 10
 *                   city: Guatemala
 *     responses:
 *       200:
 *         description: Cotización obtenida correctamente
 */
router.post('/quote', controller.cotizarPaquete);

/**
 * @swagger
 * /api/reportes-paqueteria/envio-contabilidad:
 *   post:
 *     summary: Registrar envío de paquetería en contabilidad
 *     tags: [Reportes Paquetería]
 *     security:
 *       - bearerAuth: []
 *     description: Guarda un envío de Paquetería en pedido_contabilidad y genera un movimiento financiero.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipment_id
 *               - total
 *             properties:
 *               shipment_id:
 *                 type: integer
 *                 example: 9001
 *               courier_id:
 *                 type: integer
 *                 example: 3
 *               subtotal:
 *                 type: number
 *                 example: 45.50
 *               total:
 *                 type: number
 *                 example: 45.50
 *               comision:
 *                 type: number
 *                 example: 5.00
 *               estado:
 *                 type: string
 *                 example: entregado
 *               descripcion:
 *                 type: string
 *                 example: Ingreso por envío de paquetería #9001
 *               transaction_id_banco:
 *                 type: string
 *                 example: BANK-PAQ-9001
 *               payment_id_cobros:
 *                 type: string
 *                 example: PAY-PAQ-9001
 *               idempotency_key:
 *                 type: string
 *                 example: paqueteria-envio-9001
 *     responses:
 *       201:
 *         description: Envío registrado correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post('/envio-contabilidad', verificarToken, controller.registrarEnvioContabilidad);

/**
 * @swagger
 * /api/reportes-paqueteria/cancelacion:
 *   post:
 *     summary: Registrar cancelación de envío de paquetería
 *     tags: [Reportes Paquetería]
 *     security:
 *       - bearerAuth: []
 *     description: Guarda la cancelación de un envío como egreso financiero.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipment_id
 *               - monto_cancelacion
 *             properties:
 *               shipment_id:
 *                 type: integer
 *                 example: 9002
 *               courier_id:
 *                 type: integer
 *                 example: 3
 *               monto_cancelacion:
 *                 type: number
 *                 example: 20.00
 *               estado:
 *                 type: string
 *                 example: cancelado
 *               descripcion:
 *                 type: string
 *                 example: Cancelación de envío de paquetería #9002
 *               idempotency_key:
 *                 type: string
 *                 example: paqueteria-cancelacion-9002
 *     responses:
 *       201:
 *         description: Cancelación registrada correctamente
 */
router.post('/cancelacion', verificarToken, controller.registrarCancelacionPaqueteria);

/**
 * @swagger
 * /api/reportes-paqueteria/recargo:
 *   post:
 *     summary: Registrar recargo de envío de paquetería
 *     tags: [Reportes Paquetería]
 *     security:
 *       - bearerAuth: []
 *     description: Registra un recargo por distancia, lluvia, tráfico u otra dificultad de entrega.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipment_id
 *               - monto_recargo
 *             properties:
 *               shipment_id:
 *                 type: integer
 *                 example: 9003
 *               courier_id:
 *                 type: integer
 *                 example: 4
 *               monto_recargo:
 *                 type: number
 *                 example: 12.50
 *               descripcion:
 *                 type: string
 *                 example: Recargo por lluvia fuerte en envío #9003
 *               idempotency_key:
 *                 type: string
 *                 example: paqueteria-recargo-9003
 *     responses:
 *       201:
 *         description: Recargo registrado correctamente
 */
router.post('/recargo', verificarToken, controller.registrarRecargoPaqueteria);

/**
 * @swagger
 * /api/reportes-paqueteria/resumen:
 *   get:
 *     summary: Obtener resumen financiero general de Paquetería
 *     tags: [Reportes Paquetería]
 *     responses:
 *       200:
 *         description: Resumen financiero de Paquetería
 */
router.get('/resumen', controller.obtenerResumenPaqueteria);

/**
 * @swagger
 * /api/reportes-paqueteria/resumen/repartidor/{courierId}:
 *   get:
 *     summary: Obtener resumen financiero de Paquetería por repartidor
 *     tags: [Reportes Paquetería]
 *     parameters:
 *       - in: path
 *         name: courierId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del repartidor
 *     responses:
 *       200:
 *         description: Resumen financiero por repartidor
 */
router.get('/resumen/repartidor/:courierId', controller.obtenerResumenPorRepartidor);

module.exports = router;