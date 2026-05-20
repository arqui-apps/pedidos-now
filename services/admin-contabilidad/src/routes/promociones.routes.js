//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const {
  syncPromociones,
  getReportes,
  crearPromocionFlash,
  getPromocionesFlash,
  getPromocionFlashById,
  getPromocionesFlashVigentes,
  getPromociones,
  cambiarEstadoPromocion,
  getPromocionById
} = require('../controllers/promociones.controller');

// POST

/**
 * @swagger
 * /api/promociones/reportes:
 *   post:
 *     summary: Sincronizar promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Promociones sincronizadas
 */

router.post('/api/promociones/reportes', syncPromociones);

// GET

/**
 * @swagger
 * /api/promociones/reportes:
 *   get:
 *     summary: Obtener reportes de promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Lista de reportes
 */

router.get('/api/promociones/reportes', getReportes);

// =========================
// ADMIN - PROMOCION FLASH
// =========================

/**
 * @swagger
 * /api/promociones-flash:
 *   post:
 *     summary: Crear promoción flash
 *     tags: [Promociones Flash]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Flash Mediodía
 *               descripcion:
 *                 type: string
 *                 example: Descuento relámpago en productos seleccionados
 *               tipo_descuento:
 *                 type: string
 *                 example: PORCENTAJE
 *               valor_descuento:
 *                 type: number
 *                 example: 25
 *               fecha_inicio:
 *                 type: string
 *                 example: 2026-03-11T00:00:00
 *               fecha_fin:
 *                 type: string
 *                 example: 2026-03-11T23:59:59
 *               duracion_minutos:
 *                 type: integer
 *                 example: 30
 *               alcances:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tipo_alcance:
 *                       type: string
 *                       example: PRODUCTO
 *                     referencia_id:
 *                       type: integer
 *                       example: 108
 *                     tipo_empresa:
 *                       type: string
 *                       example: RESTAURANTE
 *     responses:
 *       201:
 *         description: Promoción flash creada
 */

router.post(
  '/api/promociones-flash',
  crearPromocionFlash
);

// =========================
// GET - PROMOCIONES FLASH
// =========================

/**
 * @swagger
 * /api/promociones-flash:
 *   get:
 *     summary: Obtener promociones flash
 *     tags: [Promociones Flash]
 *     responses:
 *       200:
 *         description: Lista de promociones flash
 */

router.get(
  '/api/promociones-flash',
  getPromocionesFlash
);

// =========================
// ADMIN - GET PROMOCION FLASH POR ID
// =========================

/**
 * @swagger
 * /api/promociones-flash/{id}:
 *   get:
 *     summary: Obtener promoción flash por ID
 *     tags: [Promociones Flash]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción encontrada
 */

router.get(
  '/api/promociones-flash/:id',
  getPromocionFlashById
);

// =========================
// GET - PROMOCIONES FLASH VIGENTES
// =========================

/**
 * @swagger
 * /api/promociones-flash/vigentes:
 *   get:
 *     summary: Obtener promociones flash vigentes
 *     tags: [Promociones Flash]
 *     responses:
 *       200:
 *         description: Lista de promociones vigentes
 */

router.get(
  '/api/promociones-flash/vigentes',
  getPromocionesFlashVigentes
);

// =========================
// ADMIN - GET PROMOCIONES
// =========================

/**
 * @swagger
 * /api/promociones:
 *   get:
 *     summary: Obtener promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Lista de promociones
 */

router.get(
  '/api/promociones',
  getPromociones
);

// =========================
// ADMIN - CAMBIAR ESTADO PROMOCION
// =========================

/**
 * @swagger
 * /api/promociones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de promoción
 *     description: Permite pausar, activar o cancelar una promoción.
 *     tags: [Promociones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la promoción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum:
 *                   - PAUSADA
 *                   - ACTIVA
 *                   - CANCELADA
 *           examples:
 *             pausar:
 *               summary: Pausar promoción
 *               value:
 *                 estado: PAUSADA
 *             activar:
 *               summary: Activar promoción
 *               value:
 *                 estado: ACTIVA
 *             cancelar:
 *               summary: Cancelar promoción
 *               value:
 *                 estado: CANCELADA
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 */

router.patch(
  '/api/promociones/:id/estado',
  cambiarEstadoPromocion
);

// =========================
// ADMIN - GET PROMOCION POR ID
// =========================

/**
 * @swagger
 * /api/promociones/{id}:
 *   get:
 *     summary: Obtener promoción por ID
 *     tags: [Promociones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción encontrada
 */

router.get(
  '/api/promociones/:id',
  getPromocionById
);

module.exports = router;