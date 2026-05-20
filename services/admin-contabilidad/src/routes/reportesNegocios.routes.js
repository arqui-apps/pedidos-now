// Admin-contabilidad Victor

const express = require('express');
const router = express.Router();

const controller = require('../controllers/reportesNegocios.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { validarMonto } = require('../middleware/validar');

/**
 * @swagger
 * /api/reportes-negocios/health:
 *   get:
 *     summary: Verificar conexión con el microservicio de Negocios
 *     tags: [Reportes Negocios]
 *     responses:
 *       200:
 *         description: Conexión exitosa con Negocios
 *       500:
 *         description: Error de conexión con Negocios
 */
router.get('/health', controller.healthNegocios);

/**
 * @swagger
 * /api/reportes-negocios/businesses:
 *   get:
 *     summary: Listar negocios desde el microservicio de Negocios
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda
 *       - in: query
 *         name: businessStatus
 *         schema:
 *           type: string
 *         description: Estado del negocio
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *         description: Tipo de negocio
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *         description: Incluir negocios eliminados lógicamente
 *     responses:
 *       200:
 *         description: Lista de negocios
 */
router.get('/businesses', controller.listarNegocios);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}:
 *   get:
 *     summary: Obtener detalle de un negocio por ID
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Detalle del negocio
 */
router.get('/businesses/:businessId', controller.obtenerNegocioPorId);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/catalog:
 *   get:
 *     summary: Obtener catálogo de un negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Catálogo del negocio
 */
router.get('/businesses/:businessId/catalog', controller.obtenerCatalogoNegocio);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/products:
 *   get:
 *     summary: Obtener productos de un negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *       - in: query
 *         name: visibleInCatalog
 *         schema:
 *           type: boolean
 *         description: Filtrar productos visibles en catálogo
 *     responses:
 *       200:
 *         description: Productos del negocio
 */
router.get('/businesses/:businessId/products', controller.obtenerProductosNegocio);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/inventory:
 *   get:
 *     summary: Obtener inventario de un negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Inventario del negocio
 */
router.get('/businesses/:businessId/inventory', controller.obtenerInventarioNegocio);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/inventory/products/{productId}:
 *   get:
 *     summary: Obtener stock de un producto de negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Stock del producto
 */
router.get('/businesses/:businessId/inventory/products/:productId', controller.obtenerStockProducto);
/**
 * @swagger
 * /api/reportes-negocios/pedido-contabilidad:
 *   post:
 *     summary: Registrar pedido de negocio en contabilidad
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     description: Guarda un pedido proveniente del microservicio de Negocios en pedido_contabilidad y genera su movimiento financiero en movimiento_financiero.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_id
 *               - pedido_id
 *               - total
 *             properties:
 *               business_id:
 *                 type: integer
 *                 example: 501
 *               business_name:
 *                 type: string
 *                 example: Negocio Demo
 *               pedido_id:
 *                 type: integer
 *                 example: 7002
 *               subtotal:
 *                 type: number
 *                 example: 150.00
 *               descuento:
 *                 type: number
 *                 example: 10
 *               comision:
 *                 type: number
 *                 example: 8
 *               total:
 *                 type: number
 *                 example: 140.00
 *               estado:
 *                 type: string
 *                 example: completado
 *               descripcion:
 *                 type: string
 *                 example: Ingreso por pedido de negocio #7002
 *               repartidor_id:
 *                 type: integer
 *                 example: 24
 *               transaction_id_banco:
 *                 type: string
 *                 example: BANK-NEG-7002
 *               payment_id_cobros:
 *                 type: string
 *                 example: PAY-NEG-7002
 *               idempotency_key:
 *                 type: string
 *                 example: negocio-pedido-7002
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-18T10:00:00.000Z
 *     responses:
 *       201:
 *         description: Pedido de negocio registrado correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post('/pedido-contabilidad', verificarToken, controller.registrarPedidoContabilidadNegocio);


/**
 * @swagger
 * /api/reportes-negocios/resumen:
 *   get:
 *     summary: Obtener resumen financiero general de negocios
 *     tags: [Reportes Negocios]
 *     responses:
 *       200:
 *         description: Resumen general de pedidos de negocio
 */
router.get('/resumen', controller.obtenerResumenNegocios);


/**
 * @swagger
 * /api/reportes-negocios/resumen/{businessId}:
 *   get:
 *     summary: Obtener resumen financiero de un negocio específico
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID externo del negocio
 *     responses:
 *       200:
 *         description: Resumen financiero del negocio
 *       404:
 *         description: No se encontró información contable para este negocio
 */
router.get('/resumen/:businessId', controller.obtenerResumenNegocioPorEntidad);


/**
 * @swagger
 * /api/reportes-negocios/pedido-contabilidad:
 *   post:
 *     summary: Registrar pedido de negocio en contabilidad
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     description: Guarda un pedido proveniente del microservicio de Negocios en pedido_contabilidad y genera su movimiento financiero en movimiento_financiero.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_id
 *               - pedido_id
 *               - total
 *             properties:
 *               business_id:
 *                 type: integer
 *                 example: 501
 *               business_name:
 *                 type: string
 *                 example: Negocio Demo
 *               pedido_id:
 *                 type: integer
 *                 example: 7001
 *               subtotal:
 *                 type: number
 *                 example: 320.75
 *               descuento:
 *                 type: number
 *                 example: 20
 *               comision:
 *                 type: number
 *                 example: 15
 *               total:
 *                 type: number
 *                 example: 300.75
 *               estado:
 *                 type: string
 *                 example: completado
 *               descripcion:
 *                 type: string
 *                 example: Ingreso por pedido de negocio #7001
 *               repartidor_id:
 *                 type: integer
 *                 example: 22
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-18T03:30:00.000Z
 *     responses:
 *       201:
 *         description: Pedido de negocio registrado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post('/pedido-contabilidad', verificarToken, controller.registrarPedidoContabilidadNegocio);


/**
 * @swagger
 * /api/reportes-negocios/resumen:
 *   get:
 *     summary: Obtener resumen financiero general de negocios
 *     tags: [Reportes Negocios]
 *     responses:
 *       200:
 *         description: Resumen general de pedidos de negocio
 */
router.get('/resumen', controller.obtenerResumenNegocios);


/**
 * @swagger
 * /api/reportes-negocios/resumen/{businessId}:
 *   get:
 *     summary: Obtener resumen financiero de un negocio específico
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID externo del negocio
 *     responses:
 *       200:
 *         description: Resumen financiero del negocio
 *       404:
 *         description: No se encontró información contable para este negocio
 */
router.get('/resumen/:businessId', controller.obtenerResumenNegocioPorEntidad);



/**
 * @swagger
 * /api/reportes-negocios/movimientos/pedido:
 *   post:
 *     summary: Registrar ingreso financiero por pedido de negocio
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *             properties:
 *               cuenta_id:
 *                 type: integer
 *                 example: 1
 *               referencia_id:
 *                 type: integer
 *                 example: 202
 *               monto:
 *                 type: number
 *                 example: 320.75
 *               descripcion:
 *                 type: string
 *                 example: Ingreso por pedido de negocio
 *               pedido_id:
 *                 type: integer
 *                 example: 202
 *               repartidor_id:
 *                 type: integer
 *                 example: 22
 *               estado:
 *                 type: string
 *                 example: procesado
 *     responses:
 *       201:
 *         description: Movimiento registrado correctamente
 */
router.post('/movimientos/pedido', verificarToken, validarMonto, controller.registrarMovimientoNegocio);

/**
 * @swagger
 * /api/reportes-negocios/movimientos/cancelacion:
 *   post:
 *     summary: Registrar cancelación financiera de negocio
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cancelación registrada correctamente
 */
router.post('/movimientos/cancelacion', verificarToken, controller.registrarCancelacionNegocio);

/**
 * @swagger
 * /api/reportes-negocios/movimientos/descuento:
 *   post:
 *     summary: Registrar descuento financiero aplicado por negocio
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Descuento registrado correctamente
 */
router.post('/movimientos/descuento', verificarToken, validarMonto, controller.registrarDescuentoNegocio);

module.exports = router;