import { Router } from 'express';
/**
 * @swagger
 * /session:
 *   post:
 *     summary: Iniciar sesión de chat
 *     tags: [Session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartSession'
 *     responses:
 *       200:
 *         description: Sesión iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *             example:
 *               id_session: 1
 *               state: MENU_PRINCIPAL_CLIENTE
 *               message: "Bienvenido Cliente. Selecciona una opción:\n1 Problema con pedido\n2 Problema de cobro\n3 Consultar pedido\n4 Preguntas frecuentes"
 *               is_final: false
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /session/message:
 *   post:
 *     summary: Enviar mensaje o selección al bot
 *     tags: [Session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessage'
 *           examples:
 *             opcion:
 *               summary: Seleccionar opción del menú
 *               value:
 *                 id_session: 1
 *                 input: "1"
 *             codigo_pedido:
 *               summary: Ingresar código de pedido
 *               value:
 *                 id_session: 1
 *                 input: "PED-7"
 *                 input_type: "INPUT_CODE"
 *     responses:
 *       200:
 *         description: Mensaje procesado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Sesión no encontrada o datos inválidos
 *
 * /session/{id}:
 *   get:
 *     summary: Obtener estado actual de sesión
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estado de la sesión
 *       404:
 *         description: Sesión no encontrada
 *
 * /session/{id}/history:
 *   get:
 *     summary: Historial completo de mensajes de una sesión
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Historial de mensajes
 *       404:
 *         description: Sesión no encontrada
 *
 * /session/{id}/close:
 *   patch:
 *     summary: Cerrar sesión manualmente
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       404:
 *         description: Sesión no encontrada
 */
import {
    startSession,
    sendMessage,
    getSession,
    getSessionHistory,
    closeSession,
} from '../controllers/session.controller.js';

const router = Router();

router.post('/', startSession);
router.post('/message', sendMessage);
router.get('/:id', getSession);
router.get('/:id/history', getSessionHistory);
router.patch('/:id/close', closeSession);

export default router;