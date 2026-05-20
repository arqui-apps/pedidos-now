//Jeff. Daniel Ramos - Admin-conta
const express = require('express');
const router = express.Router();

const controller = require('../controllers/promocionesReportes.controller');

/**
 * @swagger
 * /api/promociones/reportes:
 *   post:
 *     summary: Crear reporte de promoción
 *     tags: [Reportes Promociones]
 *     responses:
 *       200:
 *         description: Reporte creado
 */
router.post('/', controller.crearReporte);

/**
 * @swagger
 * /api/promociones/reportes:
 *   get:
 *     summary: Obtener reportes de promociones
 *     tags: [Reportes Promociones]
 *     responses:
 *       200:
 *         description: Lista de reportes
 */
router.get('/', controller.listarReportes);

module.exports = router;