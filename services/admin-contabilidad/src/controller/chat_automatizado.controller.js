const service = require('../services/chat_automatizado.service');

const handle = (fn) => async (req, res) => {
    try {
        const result = await fn(req.body, req);
        res.json(result);
    } catch (error) {
        console.error({ mensaje: error.message, stack: error.stack });
        res.status(error.status || 500).json({
            ok: false,
            mensaje: 'Error al guardar datos de chat automatizado',
            detalle: error.message
        });
    }
};

const guardarSesion = handle((body) => service.guardarSesion(body));
const guardarMensaje = handle((body) => service.guardarMensaje(body));
const guardarCompensacion = handle((body) => service.guardarCompensacion(body));
const guardarSoporte = handle((body) => service.guardarSoporte(body));
const guardarConsulta = handle((body) => service.guardarConsulta(body));
const guardarLote = handle((body) => service.guardarLote(body));

const getResumen = async (req, res) => {
    try {
        const result = await service.getResumen();
        res.json(result);
    } catch (error) {
        console.error({ mensaje: error.message, stack: error.stack });
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener resumen de chat automatizado',
            detalle: error.message
        });
    }
};

const getReportesClientes = async (req, res) => {
    try {
        const result = await service.getReportesClientes();
        res.json(result);
    } catch (error) {
        console.error({ mensaje: error.message, stack: error.stack });
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener reportes de clientes de chat automatizado',
            detalle: error.message
        });
    }
};

const getReporteCliente = async (req, res) => {
    try {
        const result = await service.getReporteCliente(req.params.id_usuario);
        res.json(result);
    } catch (error) {
        console.error({ mensaje: error.message, stack: error.stack });
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener reporte del cliente de chat automatizado',
            detalle: error.message
        });
    }
};

module.exports = {
    guardarSesion,
    guardarMensaje,
    guardarCompensacion,
    guardarSoporte,
    guardarConsulta,
    guardarLote,
    getResumen,
    getReportesClientes,
    getReporteCliente
};
