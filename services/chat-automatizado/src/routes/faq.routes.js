import { Router } from 'express';
/**
 * @swagger
 * /support/api/faqs:
 *   get:
 *     summary: Listar preguntas frecuentes
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: category_type
 *         schema:
 *           type: string
 *           enum: [cliente, repartidor, restaurante, farmacia, supermercado, paqueteria]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por texto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FAQ'
 *
 *   post:
 *     summary: Crear nueva FAQ
 *     tags: [FAQs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFAQ'
 *     responses:
 *       201:
 *         description: FAQ creada exitosamente
 *       400:
 *         description: Datos inválidos
 *
 * /support/api/faqs/{id}:
 *   get:
 *     summary: Obtener FAQ por ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: FAQ encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQ'
 *       404:
 *         description: FAQ no encontrada
 *
 *   patch:
 *     summary: Actualizar FAQ
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:   { type: string }
 *               answer:     { type: string }
 *               faq_status: { type: string, enum: [active, inactive, archive] }
 *     responses:
 *       200:
 *         description: FAQ actualizada
 *       404:
 *         description: FAQ no encontrada
 *
 *   delete:
 *     summary: Desactivar FAQ
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: FAQ desactivada
 *       404:
 *         description: FAQ no encontrada
 *
 * /compensation:
 *   get:
 *     summary: Listar compensaciones
 *     tags: [Compensation]
 *     responses:
 *       200:
 *         description: Lista de compensaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Compensation'
 *
 * /compensation/{id}:
 *   get:
 *     summary: Obtener compensación por ID
 *     tags: [Compensation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compensación encontrada
 *       404:
 *         description: No encontrada
 *
 * /compensation/validate/{code}:
 *   get:
 *     summary: Validar vigencia de cupón
 *     tags: [Compensation]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: COMP-1-VOY2K8
 *     responses:
 *       200:
 *         description: Resultado de validación
 *
 * /escalation:
 *   get:
 *     summary: Listar casos escalados
 *     tags: [Escalation]
 *     responses:
 *       200:
 *         description: Lista de escalaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Escalation'
 *
 * /escalation/{id}:
 *   get:
 *     summary: Obtener payload completo de escalación
 *     tags: [Escalation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Escalación encontrada
 *       404:
 *         description: No encontrada
 *
 * /escalation/session/{id_session}:
 *   get:
 *     summary: Buscar escalación por sesión (para el Broker)
 *     tags: [Escalation]
 *     parameters:
 *       - in: path
 *         name: id_session
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Escalación encontrada
 *       404:
 *         description: No encontrada
 *
 * /escalation/{id}/status:
 *   patch:
 *     summary: Actualizar estado del handoff
 *     tags: [Escalation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               handoff_status:
 *                 type: string
 *                 enum: [pendiente, recibido, en_atencion, cerrado]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *
 * /health:
 *   get:
 *     summary: Estado del servicio y servicios externos
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             example:
 *               status: ok
 *               service: chat-automatizado
 *               checks:
 *                 database: { status: ok }
 *                 auth: { status: unavailable }
 *                 pedidos: { status: ok }
 *       503:
 *         description: Servicio degradado
 *
 * /menu:
 *   get:
 *     summary: Obtener menús del bot
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: user_type
 *         schema:
 *           type: string
 *           enum: [cliente, repartidor, negocio]
 *     responses:
 *       200:
 *         description: Menús disponibles
 *
 * /message:
 *   get:
 *     summary: Mensajes de una sesión
 *     tags: [Message]
 *     parameters:
 *       - in: query
 *         name: id_session
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *
 * /inquiry:
 *   get:
 *     summary: Consultas de pedidos registradas
 *     tags: [Inquiry]
 *     responses:
 *       200:
 *         description: Lista de consultas
 *
 * /support:
 *   get:
 *     summary: Solicitudes de soporte de repartidores
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
import {
  createFaq,
  deleteFaq,
  getFaqById,
  getFaqs,
  updateFaq,
} from '../controllers/faq.controller.js';

const router = Router();

router.get('/', getFaqs);
router.get('/:id', getFaqById);
router.post('/', createFaq);
router.patch('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;
