//Admin-conta Jeff. Daniel Ramos
const { PromocionReporte } = require('../models');

const guardarReportePromocion = async (data) => {

  return await PromocionReporte.create({
    cliente_id: data.cliente_id,
    promocion_id: data.promocion_id,
    pedido_id: data.pedido_id,
    empresa_id: data.empresa_id,
    monto_descuento: data.monto_descuento
  });
};

const obtenerReportes = async () => {

  return await PromocionReporte.findAll({
    order: [['createdAt', 'DESC']]
  });
};

module.exports = {
  guardarReportePromocion,
  obtenerReportes
};
