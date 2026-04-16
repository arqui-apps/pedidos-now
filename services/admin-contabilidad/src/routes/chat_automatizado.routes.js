const express = require('express');
const router = express.Router();
const controller = require('../controller/chat_automatizado.controller');
const middleware = require('../middleware/chat_automatizado.middleware');

router.post('/sesiones', middleware.validateSesion, controller.guardarSesion);
router.post('/mensajes', middleware.validateMensaje, controller.guardarMensaje);
router.post('/compensaciones', middleware.validateCompensacion, controller.guardarCompensacion);
router.post('/soporte', middleware.validateSoporte, controller.guardarSoporte);
router.post('/consultas', middleware.validateConsulta, controller.guardarConsulta);
router.post('/sync', middleware.validateSync, controller.guardarLote);
router.get('/resumen', controller.getResumen);
router.get('/reportes/clientes', controller.getReportesClientes);
router.get('/reportes/clientes/:id_usuario', middleware.validateClienteParam, controller.getReporteCliente);

module.exports = router;
