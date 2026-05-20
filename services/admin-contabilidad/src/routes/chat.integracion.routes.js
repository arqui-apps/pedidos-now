const { Router } = require('express');
const ctrl = require('../controllers/chat.integracion.controller');

const router = Router();

// ── Inbound (Broker → Admin) ─────────────────────────────────
router.post('/resolucion',                           ctrl.recibirResolucion);

// ── Gestión interna de resoluciones pendientes ───────────────
router.get('/resoluciones',                          ctrl.listarResoluciones);
router.patch('/resoluciones/:id/procesar',           ctrl.procesarResolucion);

// ── Outbound (Admin → Broker → Chats) ───────────────────────
router.get('/conversaciones',                        ctrl.listarConversaciones);
router.get('/conversaciones/:id',                    ctrl.obtenerConversacion);
router.get('/conversaciones/:id/mensajes',           ctrl.obtenerMensajes);
router.patch('/conversaciones/:id/estado',           ctrl.cambiarEstado);
router.patch('/conversaciones/:id/agente',           ctrl.asignarAgente);

// ── Reportes ─────────────────────────────────────────────────
router.get('/estadisticas',                          ctrl.generarEstadisticas);

module.exports = router;
