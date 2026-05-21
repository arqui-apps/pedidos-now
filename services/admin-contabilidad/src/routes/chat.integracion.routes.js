const { Router } = require('express');
const ctrl = require('../controllers/chat.integracion.controller');

const router = Router();

// ── Inbound (Broker → Admin) ─────────────────────────────────

/**
 * @swagger
 * /api/chats/resolucion:
 *   post:
 *     summary: Recibir notificación de resolución financiera desde Chats
 *     description: El microservicio de Chats llama a este endpoint (webhook) cuando un agente cierra una conversación con resolución RESOLVED_REFUND o RESOLVED_COUPON. Registra el caso como pendiente para revisión del agente admin.
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversation_id, requester_type, requester_ext_id]
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 example: "3d0e8f5f-5327-11f1-b7d0-a2aa3582ff8d"
 *               tipo_resolucion:
 *                 type: string
 *                 enum: [RESOLVED_REFUND, RESOLVED_COUPON, RESOLVED_NO_SOLUTION, CLOSED_MANUAL]
 *                 example: "RESOLVED_REFUND"
 *               status:
 *                 type: string
 *                 description: Alias de tipo_resolucion en formato webhook de Chats
 *                 example: "RESOLVED_REFUND"
 *               requester_type:
 *                 type: string
 *                 enum: [CUSTOMER, COURIER, BUSINESS]
 *                 example: "CUSTOMER"
 *               requester_ext_id:
 *                 type: string
 *                 example: "42"
 *               case_type:
 *                 type: string
 *                 enum: [ORDER, DELIVERY, BUSINESS_CASE, OTHER]
 *                 example: "ORDER"
 *               case_reference:
 *                 type: string
 *                 example: "PED-1001"
 *     responses:
 *       201:
 *         description: Resolución registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat_resolucion_id: { type: integer, example: 1 }
 *                     estado: { type: string, example: "pendiente" }
 *                     ya_existia: { type: boolean, example: false }
 *       200:
 *         description: La conversación ya tenía una resolución registrada
 *       400:
 *         description: Faltan campos obligatorios
 */
router.post('/resolucion', ctrl.recibirResolucion);

// ── Gestión interna de resoluciones pendientes ───────────────

/**
 * @swagger
 * /api/chats/resoluciones:
 *   get:
 *     summary: Listar resoluciones financieras pendientes
 *     description: Devuelve las resoluciones recibidas desde Chats que están pendientes de procesamiento por el agente admin.
 *     tags: [Chats]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, procesado, rechazado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: tipo_resolucion
 *         schema:
 *           type: string
 *           enum: [RESOLVED_REFUND, RESOLVED_COUPON, RESOLVED_NO_SOLUTION, CLOSED_MANUAL]
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Lista de resoluciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { type: array }
 *                 count: { type: integer, example: 5 }
 */
router.get('/resoluciones', ctrl.listarResoluciones);

/**
 * @swagger
 * /api/chats/resoluciones/{id}/procesar:
 *   patch:
 *     summary: Marcar resolución como procesada
 *     description: El agente admin ya creó el reembolso o compensación por los endpoints correspondientes y aquí vincula el ID resultante a la resolución del chat.
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la resolución
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reembolso_id:
 *                 type: integer
 *                 example: 7
 *               compensacion_id:
 *                 type: integer
 *                 example: null
 *               notas:
 *                 type: string
 *                 example: "Reembolso aprobado y procesado"
 *     responses:
 *       200:
 *         description: Resolución marcada como procesada
 *       404:
 *         description: Resolución no encontrada
 *       409:
 *         description: La resolución ya fue procesada anteriormente
 */
router.patch('/resoluciones/:id/procesar', ctrl.procesarResolucion);

// ── Outbound (Admin → Broker → Chats) ───────────────────────

/**
 * @swagger
 * /api/chats/conversaciones:
 *   get:
 *     summary: Listar conversaciones del servicio de Chats
 *     description: Consulta conversaciones directamente al microservicio de Chats. Útil para reportes y dashboard del módulo admin.
 *     tags: [Chats]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_QUEUE, IN_PROGRESS, RESOLVED_REFUND, RESOLVED_COUPON, RESOLVED_NO_SOLUTION, CLOSED_MANUAL, CLOSED_TIMEOUT]
 *         description: Filtrar por estado de la conversación
 *       - in: query
 *         name: requester_type
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, COURIER, BUSINESS]
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date, example: "2026-05-01" }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date, example: "2026-05-31" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Lista de conversaciones con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items: { type: array }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer }
 *                         limit: { type: integer }
 *                         total: { type: integer }
 *                         total_pages: { type: integer }
 */
router.get('/conversaciones', ctrl.listarConversaciones);

/**
 * @swagger
 * /api/chats/conversaciones/{id}:
 *   get:
 *     summary: Obtener detalle de una conversación
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la conversación
 *         example: "3d0e8f5f-5327-11f1-b7d0-a2aa3582ff8d"
 *     responses:
 *       200:
 *         description: Detalle de la conversación
 *       404:
 *         description: Conversación no encontrada
 */
router.get('/conversaciones/:id', ctrl.obtenerConversacion);

/**
 * @swagger
 * /api/chats/conversaciones/{id}/mensajes:
 *   get:
 *     summary: Obtener mensajes de una conversación
 *     description: Historial de mensajes como evidencia al revisar un reembolso o compensación.
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la conversación
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lista de mensajes de la conversación
 */
router.get('/conversaciones/:id/mensajes', ctrl.obtenerMensajes);

/**
 * @swagger
 * /api/chats/conversaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una conversación en Chats
 *     description: Cierra o actualiza el estado de la conversación en el microservicio de Chats después de procesar el reembolso o compensación.
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la conversación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [new_status]
 *             properties:
 *               new_status:
 *                 type: string
 *                 enum: [RESOLVED_REFUND, RESOLVED_COUPON, RESOLVED_NO_SOLUTION, CLOSED_MANUAL]
 *                 example: "RESOLVED_REFUND"
 *               changed_by_ext_id:
 *                 type: string
 *                 example: "admin-01"
 *               reason:
 *                 type: string
 *                 example: "Reembolso procesado correctamente"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: new_status inválido
 */
router.patch('/conversaciones/:id/estado', ctrl.cambiarEstado);

/**
 * @swagger
 * /api/chats/conversaciones/{id}/agente:
 *   patch:
 *     summary: Asignar agente a una conversación
 *     description: Reasigna un agente de soporte desde el panel de Admin/Contabilidad.
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la conversación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agent_ext_id]
 *             properties:
 *               agent_ext_id:
 *                 type: string
 *                 example: "agent-05"
 *               agent_display_name:
 *                 type: string
 *                 example: "Carlos López"
 *     responses:
 *       200:
 *         description: Agente asignado correctamente
 *       400:
 *         description: agent_ext_id es obligatorio
 */
router.patch('/conversaciones/:id/agente', ctrl.asignarAgente);

// ── Reportes ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/chats/estadisticas:
 *   get:
 *     summary: Generar estadísticas de chats por período
 *     description: Consulta al microservicio de Chats el total de conversaciones por estado en el período indicado y guarda el resumen en la base de datos para reportes contables.
 *     tags: [Chats]
 *     parameters:
 *       - in: query
 *         name: periodo_inicio
 *         required: true
 *         schema: { type: string, format: date, example: "2026-05-01" }
 *       - in: query
 *         name: periodo_fin
 *         required: true
 *         schema: { type: string, format: date, example: "2026-05-31" }
 *       - in: query
 *         name: reporte_id
 *         schema: { type: integer }
 *         description: ID del reporte al que vincular las estadísticas (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas generadas y guardadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     total_conversaciones: { type: integer, example: 18 }
 *                     resueltas_reembolso: { type: integer, example: 5 }
 *                     resueltas_cupon: { type: integer, example: 3 }
 *                     resueltas_sin_solucion: { type: integer, example: 2 }
 *                     cerradas_timeout: { type: integer, example: 4 }
 *                     cerradas_manual: { type: integer, example: 4 }
 *                     monto_reembolsado: { type: number, example: 250.00 }
 *                     monto_compensado: { type: number, example: 75.50 }
 *       400:
 *         description: periodo_inicio y periodo_fin son requeridos
 */
router.get('/estadisticas', ctrl.generarEstadisticas);

module.exports = router;
