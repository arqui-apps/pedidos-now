const service = require('../services/compensacion.service');
const repo = require('../repositories/compensacion.repository');

const getAllCompensaciones = async (req, res) => {
    try {
        const compensaciones = await repo.getAllCompensaciones();
        res.json({
            ok: true,
            data: compensaciones,
            count: compensaciones.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener compensaciones',
            detalle: error.message
        });
    }
};

const crearCompensacion = async (req, res) => {
    try {
        const data = req.body;

        if (!data.monto || data.monto <= 0) {
            return res.status(400).json({
                error: 'Monto inválido'
            });
        }

        const result = await service.registrarCompensacion(data);

        res.json(result);
    } catch (error) {
        console.error(error);        
        res.status(500).json({
            ok: false,
            mensaje: 'Error al procesar compensación',
            detalle: error.message
        });
    }
};

module.exports = {
    getAllCompensaciones,
    crearCompensacion
};
