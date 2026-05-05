// Admin-Conta Jeff. Daniel Ramos

const movimientoService = require('../../services/movimiento.service.mock');
// MOCK LOCAL (solo para entrega)
const eventoRepo = {
  guardarEvento: async (data) => {
    console.log('MOCK EVENTO:', data);
  }
};
const promoService = require('../../services/promocionContabilidad.service');

module.exports = async (evento) => {
  console.log('👉 Handler ejecutándose');

  if (evento.tipo === 'PROMOCION_APLICADA') {
    const { pedido_id, cliente_id, promociones } = evento.data;

    for (const promo of promociones) {
      const {
        promocion_id,
        tipo_alcance,
        referencia_id,
        monto_descuento,
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        tipo
      } = promo;

      // guardar evento
      await eventoRepo.guardarEvento({
        modulo_origen: 'promociones',
        tipo_evento: evento.tipo,
        referencia_id: pedido_id,
        payload: {
          promocion_id,
          tipo_alcance,
          referencia_id,
          monto_descuento,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          tipo
        }
      });

      // movimiento contable (egreso)
      await movimientoService.registrarEgreso({
        tipo: 'descuento_promocion',
        empleado_id: cliente_id,
        monto: monto_descuento,
        descripcion: `Descuento promo #${promocion_id}`
      });

      // 🔥 TU PARTE (perfecta)
      await promoService.registrarPromocionAplicada({
        pedido_id,
        cliente_id,
        promocion_id,
        tipo_alcance,
        referencia_id,
        monto_descuento
      });
    }

    console.log('✅ Flujo promoción aplicada ejecutado');
  }
};
