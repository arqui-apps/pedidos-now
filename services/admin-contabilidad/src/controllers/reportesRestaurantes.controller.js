// Admin-contabilidad Emmanuel
const reportesRestaurantesService = require('../services/reportesRestaurantes.service');

// Admin-contabilidad Emmanuel
const reportesRestaurantesRepository = require('../repositories/reportesRestaurantes.repository');

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

// Admin-contabilidad Emmanuel
const registrarPedidoContabilidadRestaurante = async (req, res) => {
  try {
    const resultado = await reportesRestaurantesRepository.guardarPedidoYMovimientoRestaurante(req.body);

    res.status(201).json({
      ok: true,
      mensaje: 'Pedido de restaurante registrado en contabilidad correctamente',
      modulo: 'restaurantes',
      data: resultado
    });
  } catch (error) {
    console.error('Error registrando pedido de restaurante en contabilidad:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar pedido de restaurante en contabilidad',
      error: error.message
    });
  }
};

// Admin-contabilidad Emmanuel
const registrarCancelacionRestaurante = async (req, res) => {
  try {
    const resultado = await reportesRestaurantesRepository.registrarCancelacionRestaurante(req.body);

    res.status(201).json({
      ok: true,
      mensaje: 'Cancelación de restaurante registrada en contabilidad correctamente',
      modulo: 'restaurantes',
      data: resultado
    });
  } catch (error) {
    console.error('Error registrando cancelación de restaurante:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar cancelación de restaurante',
      error: error.message
    });
  }
};

// Admin-contabilidad Emmanuel
const obtenerResumenRestaurantesOrm = async (req, res) => {
  try {
    const data = await reportesRestaurantesRepository.obtenerResumenRestaurantes();

    res.status(200).json({
      ok: true,
      modulo: 'restaurantes',
      reporte: 'resumen_general',
      mensaje: 'Resumen ORM de restaurantes obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo resumen ORM de restaurantes:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen ORM de restaurantes',
      error: error.message
    });
  }
};

// Admin-contabilidad Emmanuel
const obtenerResumenRestaurantePorEntidad = async (req, res) => {
  try {
    const { restauranteId } = req.params;

    const data = await reportesRestaurantesRepository.obtenerResumenRestaurantePorEntidad(restauranteId);

    if (!data) {
      return res.status(404).json({
        ok: false,
        modulo: 'restaurantes',
        mensaje: 'No se encontró información contable para este restaurante'
      });
    }

    res.status(200).json({
      ok: true,
      modulo: 'restaurantes',
      reporte: 'resumen_por_restaurante',
      restauranteId,
      mensaje: 'Resumen ORM del restaurante obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo resumen ORM por restaurante:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen ORM del restaurante',
      error: error.message
    });
  }
};

module.exports = {
  obtenerResumenRestaurantes,
  obtenerResumenRestaurantePorId,
  obtenerReporteCancelacionesYMultas,

  // Admin-contabilidad Emmanuel
  registrarPedidoContabilidadRestaurante,
  registrarCancelacionRestaurante,
  obtenerResumenRestaurantesOrm,
  obtenerResumenRestaurantePorEntidad
};