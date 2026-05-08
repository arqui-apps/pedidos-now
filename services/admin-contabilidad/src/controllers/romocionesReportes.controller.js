//Admin-contabilidad Jeff. Daniel Ramos
const reportesService = require('../services/promocionesReportes.service');

const guardarReporte = async (req, res) => {

  try {

    const reporte = await reportesService.guardarReportePromocion(req.body);

    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const obtenerReportes = async (req, res) => {

  try {

    const reportes = await reportesService.obtenerReportes();

    res.json({
      success: true,
      data: reportes
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  guardarReporte,
  obtenerReportes
};
