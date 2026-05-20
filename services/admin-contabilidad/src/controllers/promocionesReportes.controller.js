//Admin-conta Jeff. Daniel Ramos
const service = require('../services/promocionesReportes.service');

const crearReporte = async (req, res) => {
  try {
    const data = await service.guardarReporte(req.body);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const listarReportes = async (req, res) => {
  try {
    const data = await service.obtenerReportes();

    res.json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  crearReporte,
  listarReportes
};