// Admin-Conta Jeff. Daniel Ramos

// mocks (SIN BD)
const movimientoService = {
  registrarEgreso: async (data) => {
    console.log('Mock egreso:', data);
  }
};

const eventoRepo = {
  guardarEvento: async (data) => {
    console.log('Mock evento guardado:', data);
  }
};

module.exports = async (evento) => {
  console.log('👉 Handler ejecutándose');

  if (evento.tipo === 'PROMOCION_APLICADA') {
    const { pedido_id, cliente_id, promociones } = evento.data;

    for (const promo of promociones) {
      const {
        promocion_id,
        tipo_alcance,
        referencia_id,
        monto_descuento
      } = promo;

      // guardar evento
      await eventoRepo.guardarEvento({
        modulo_origen: 'promociones',
        tipo_evento: evento.tipo,
        referencia_id: pedido_id,
        payload: promo
      });

      // registrar egreso
      await movimientoService.registrarEgreso({
        tipo: 'descuento_promocion',
        empleado_id: cliente_id,
        monto: monto_descuento,
        descripcion: `Descuento promo #${promocion_id} aplicado a ${tipo_alcance} ${referencia_id}`
      });
    }

    console.log('✅ Flujo promoción aplicada ejecutado');
  }
};
