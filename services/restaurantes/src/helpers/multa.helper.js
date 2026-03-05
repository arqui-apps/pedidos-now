/**
 * Calcular multa por cancelación de pedido según tiempo transcurrido
 * 
 * Reglas de negocio (ajustar según necesidad):
 * - Cancelación dentro de las primeras 5 minutos: Sin multa
 * - Cancelación después de 5 minutos: 10% del total
 * - Cancelación después de pedido confirmado: 25% del total
 * - Cancelación en preparación: 50% del total
 */
const calcularMulta = (pedido) => {
  const { estado, total, fechaPedido } = pedido;
  
  // Sin multa si ya está cancelado, entregado o completado
  if (['cancelado', 'entregado', 'listo'].includes(estado)) {
    return 0;
  }
  
  const minutosTranscurridos = (Date.now() - new Date(fechaPedido)) / (1000 * 60);
  
  // Sin multa en primeros 5 minutos
  if (minutosTranscurridos <= 5) {
    return 0;
  }
  
  // Multa según estado del pedido
  const tasasMulta = {
    'pendiente': 0.10,      // 10%
    'confirmado': 0.25,     // 25%
    'en_preparacion': 0.50  // 50%
  };
  
  const tasa = tasasMulta[estado] || 0;
  const multa = parseFloat(total) * tasa;
  
  return Math.round(multa * 100) / 100; // Redondear a 2 decimales
};

module.exports = {
  calcularMulta
};
