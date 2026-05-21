// Admin-contabilidad Emmanuel

const reportesRestaurantesService = require('./src/services/reportesRestaurantes.service');

const probarReporte = async () => {
  try {
    const resumen = await reportesRestaurantesService.obtenerResumenRestaurantes();
    console.log('Resumen de restaurantes:');
    console.table(resumen);
  } catch (error) {
    console.error('Error generando reporte de restaurantes:', error);
  }
};

probarReporte();