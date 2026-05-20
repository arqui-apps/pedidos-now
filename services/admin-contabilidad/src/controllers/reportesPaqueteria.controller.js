// Admin-contabilidad Kenneth

const paqueteriaService = require('../services/paqueteria.service');
const reportesPaqueteriaRepository = require('../repositories/reportesPaqueteria.repository');

const healthPaqueteria = async (req, res) => {
  try {
    const data = await paqueteriaService.verificarSaludPaqueteria();

    res.status(200).json({
      ok: true,
      service: 'admin-contabilidad',
      externalService: 'paqueteria',
      externalUrl: process.env.PAQUETERIA_SERVICE_URL,
      data
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      ok: false,
      service: 'admin-contabilidad',
      externalService: 'paqueteria',
      message: 'No se pudo conectar con el microservicio de Paquetería',
      externalUrl: process.env.PAQUETERIA_SERVICE_URL,
      error: error.response?.data || error.message
    });
  }
};

const listarEnvios = async (req, res, next) => {
  try {
    const data = await paqueteriaService.listarEnvios(req.query);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      data
    });
  } catch (error) {
    next(error);
  }
};

const obtenerEnvioPorId = async (req, res, next) => {
  try {
    const { shipmentId } = req.params;
    const data = await paqueteriaService.obtenerEnvioPorId(shipmentId);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      shipmentId,
      data
    });
  } catch (error) {
    next(error);
  }
};

const listarPaquetes = async (req, res, next) => {
  try {
    const data = await paqueteriaService.listarPaquetes(req.query);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      data
    });
  } catch (error) {
    next(error);
  }
};

const obtenerPaquetePorId = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const data = await paqueteriaService.obtenerPaquetePorId(packageId);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      packageId,
      data
    });
  } catch (error) {
    next(error);
  }
};

const listarRepartidores = async (req, res, next) => {
  try {
    const data = await paqueteriaService.listarRepartidores(req.query);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      data
    });
  } catch (error) {
    next(error);
  }
};

const listarRepartidoresDisponibles = async (req, res, next) => {
  try {
    const data = await paqueteriaService.listarRepartidoresDisponibles();

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      data
    });
  } catch (error) {
    next(error);
  }
};

const listarPrecios = async (req, res, next) => {
  try {
    const data = await paqueteriaService.listarPrecios(req.query);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      data
    });
  } catch (error) {
    next(error);
  }
};

const cotizarPaquete = async (req, res, next) => {
  try {
    const data = await paqueteriaService.cotizarPaquete(req.body);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      data
    });
  } catch (error) {
    next(error);
  }
};

const obtenerTrackingPaquete = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const customerToken = req.headers['x-customer-token'] || null;

    const data = await paqueteriaService.obtenerTrackingPaquete(packageId, customerToken);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      packageId,
      data
    });
  } catch (error) {
    next(error);
  }
};

const registrarEnvioContabilidad = async (req, res) => {
  try {
    const resultado = await reportesPaqueteriaRepository.guardarEnvioContabilidadPaqueteria(req.body);

    res.status(201).json({
      ok: true,
      mensaje: 'Envío de paquetería registrado en contabilidad correctamente',
      modulo: 'paqueteria',
      data: resultado
    });
  } catch (error) {
    console.error('Error registrando envío de paquetería:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar envío de paquetería en contabilidad',
      error: error.message
    });
  }
};

const registrarCancelacionPaqueteria = async (req, res) => {
  try {
    const resultado = await reportesPaqueteriaRepository.guardarCancelacionPaqueteria(req.body);

    res.status(201).json({
      ok: true,
      mensaje: 'Cancelación de paquetería registrada en contabilidad correctamente',
      modulo: 'paqueteria',
      data: resultado
    });
  } catch (error) {
    console.error('Error registrando cancelación de paquetería:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar cancelación de paquetería',
      error: error.message
    });
  }
};

const registrarRecargoPaqueteria = async (req, res) => {
  try {
    const resultado = await reportesPaqueteriaRepository.guardarRecargoPaqueteria(req.body);

    res.status(201).json({
      ok: true,
      mensaje: 'Recargo de paquetería registrado en contabilidad correctamente',
      modulo: 'paqueteria',
      data: resultado
    });
  } catch (error) {
    console.error('Error registrando recargo de paquetería:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar recargo de paquetería',
      error: error.message
    });
  }
};

const obtenerResumenPaqueteria = async (req, res) => {
  try {
    const data = await reportesPaqueteriaRepository.obtenerResumenPaqueteria();

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      reporte: 'resumen_general',
      mensaje: 'Resumen de paquetería obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo resumen de paquetería:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen de paquetería',
      error: error.message
    });
  }
};

const obtenerResumenPorRepartidor = async (req, res) => {
  try {
    const { courierId } = req.params;

    const data = await reportesPaqueteriaRepository.obtenerResumenPorRepartidor(courierId);

    res.status(200).json({
      ok: true,
      modulo: 'paqueteria',
      reporte: 'resumen_por_repartidor',
      courierId,
      mensaje: 'Resumen de paquetería por repartidor obtenido correctamente',
      data
    });
  } catch (error) {
    console.error('Error obteniendo resumen de paquetería por repartidor:', error);

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen de paquetería por repartidor',
      error: error.message
    });
  }
};

module.exports = {
  healthPaqueteria,
  listarEnvios,
  obtenerEnvioPorId,
  listarPaquetes,
  obtenerPaquetePorId,
  listarRepartidores,
  listarRepartidoresDisponibles,
  listarPrecios,
  cotizarPaquete,
  obtenerTrackingPaquete,
  registrarEnvioContabilidad,
  registrarCancelacionPaqueteria,
  registrarRecargoPaqueteria,
  obtenerResumenPaqueteria,
  obtenerResumenPorRepartidor
};