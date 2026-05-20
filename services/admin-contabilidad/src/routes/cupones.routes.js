//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const {
  crearCuponLealtad,
  activarCupon,
  cancelarCupon,
  vencerCupones,
  getCuponById,
  getCuponByCodigo
} = require('../controllers/cupones.controller');

// =========================
// ADMIN - CUPONES LEALTAD
// =========================
///////

/**
 * @swagger
 * /api/cupones/lealtad:
 *   post:
 *     summary: Crear cupón de lealtad
 *     tags: [Cupones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: LEALTAD
 *               cliente_id:
 *                 type: integer
 *                 example: 1
 *               tipo_descuento:
 *                 type: string
 *                 example: PORCENTAJE
 *               valor_descuento:
 *                 type: number
 *                 example: 10
 *               monto_minimo_pedido:
 *                 type: number
 *                 example: 50
 *               origen_solicitud:
 *                 type: string
 *                 example: SISTEMA
 *               solicitado_por:
 *                 type: string
 *                 example: proceso_lealtad_automatico
 *               criterio_lealtad:
 *                 type: string
 *                 example: FRECUENCIA_PEDIDOS
 *     responses:
 *       200:
 *         description: Cupón creado correctamente
 */

router.post(
  '/api/cupones/lealtad',
  crearCuponLealtad
);


// =========================
// ADMIN - ACTIVAR CUPON
// =========================

/**
 * @swagger
 * /api/cupones/{id}/activar:
 *   patch:
 *     summary: Activar cupón
 *     tags: [Cupones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cupón activado correctamente
 */

router.patch(
  '/api/cupones/:id/activar',
  activarCupon
);

// =========================
// ADMIN - CANCELAR CUPON
// =========================

/**
 * @swagger
 * /api/cupones/{id}/cancelar:
 *   patch:
 *     summary: Cancelar cupón manualmente
 *     tags: [Cupones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cupón cancelado exitosamente
 *       404:
 *         description: CUPON_NO_ENCONTRADO
 *       422:
 *         description: CUPON_YA_USADO o CUPON_YA_CANCELADO
 */

router.patch(
  '/api/cupones/:id/cancelar',
  cancelarCupon
);

// =========================
// ADMIN - VENCER CUPONES
// =========================

/**
 * @swagger
 * /api/cupones/vencer:
 *   patch:
 *     summary: Vencer cupones expirados
 *     tags: [Cupones]
 *     responses:
 *       200:
 *         description: Cupones vencidos correctamente
 */

router.patch(
  '/api/cupones/vencer',
  vencerCupones
);

// =========================
// ADMIN - CUPON POR CODIGO
// =========================

/**
 * @swagger
 * /api/cupones/codigo/{codigo}:
 *   get:
 *     summary: Obtener cupón por código
 *     tags: [Cupones]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cupón encontrado
 */

router.get(
  '/api/cupones/codigo/:codigo',
  getCuponByCodigo
);


// =========================
// ADMIN - CUPON POR ID
// =========================

/**
 * @swagger
 * /api/cupones/{id}:
 *   get:
 *     summary: Obtener cupón por ID
 *     tags: [Cupones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cupón encontrado
 */

router.get(
  '/api/cupones/:id',
  getCuponById
);

module.exports = router;