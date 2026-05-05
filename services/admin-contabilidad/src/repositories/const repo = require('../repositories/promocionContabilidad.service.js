const repo = require('../repositories/promocionContabilidad.repository');

const registrarPromocionAplicada = async ({
  pedido_id,
  cliente_id,
  promocion_id,
  tipo_alcance,
  referencia_id,
  monto_descuento
}) => {
  return await repo.crearRegistroPromocion({
    pedido_id,
    cliente_id,
    promocion_id,
    tipo_alcance,
    referencia_id,
    monto_descuento
  });
};

module.exports = {
  registrarPromocionAplicada
};
