// Admin-contabilidad Emmanuel

const reportesRestaurantesService = require('../services/reportesRestaurantes.service');

const obtenerResumenRestaurantes = async (req, res) => {
  try {
    const data = await reportesRestaurantesService.obtenerResumenRestaurantes();

    res.status(200).json({
      ok: true,
      mensaje: 'Resumen de restaurantes obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo resumen de restaurantes:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen de restaurantes'
    });
  }
};

const obtenerResumenRestaurantePorId = async (req, res) => {
  try {
    const { entidadId } = req.params;

    const data = await reportesRestaurantesService.obtenerResumenRestaurantePorId(entidadId);

    if (!data) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró resumen para el restaurante indicado'
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Resumen del restaurante obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo resumen por restaurante:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen del restaurante'
    });
  }
};

const obtenerReporteCancelacionesYMultas = async (req, res) => {
  try {
    const data = await reportesRestaurantesService.obtenerReporteCancelacionesYMultas();

    res.status(200).json({
      ok: true,
      mensaje: 'Reporte de cancelaciones y multas obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo reporte de cancelaciones y multas:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener reporte de cancelaciones y multas'
    });
  }
};
module.exports = {
  obtenerResumenRestaurantes,
  obtenerResumenRestaurantePorId,
  obtenerReporteCancelacionesYMultas
};