// Admin-contabilidad Emmanuel

const reportesRestaurantesRepo = require('../repositories/reportesRestaurantes.repository');

const obtenerResumenRestaurantes = async () => {
  return await reportesRestaurantesRepo.obtenerResumenPorRestaurante();
};

const obtenerResumenRestaurantePorId = async (entidadComercialId) => {
  return await reportesRestaurantesRepo.obtenerResumenPorEntidadComercial(entidadComercialId);
};

const obtenerReporteCancelacionesYMultas = async () => {
  return await reportesRestaurantesRepo.obtenerResumenCancelacionesYMultas();
};
module.exports = {
  
  obtenerResumenRestaurantes,
  obtenerResumenRestaurantePorId,
  obtenerReporteCancelacionesYMultas
};