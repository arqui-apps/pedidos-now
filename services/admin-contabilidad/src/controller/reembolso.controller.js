const service = require('../services/reembolso.service');
const repo = require('../repositories/reembolso.repository');

const getAllReembolsos = async (req, res) => {
    try {
        const reembolso = await repo.getAllReembolsos();
        res.json({
            ok: true,
            data: reembolso,
            count: reembolso.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener reembolsos',
            detalle: error.message
        });
    }
};

const crearReembolso = async (req, res) => {
    try {
        const data = req.body;

        const result = await service.registrarReembolso(data);

        res.json({
            ok: true,
            data: result
        });
    } catch(error) {
        console.error("Error Reembolso", error);       
        res.status(500).json({
            ok: false,
            error:'Error al procesar reembolso'
        });
    }
};

module.exports = {
    crearReembolso,
    getAllReembolsos
}