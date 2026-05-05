// Admin-Conta Jeff. Daniel Ramos

// ✅ mocks (SIN BD)
const movimientoService = {
  registrarEgreso: async (data) => {
    console.log('Mock egreso:', data);
  },
  registrarIngresoPedido: async (data) => {
    console.log('Mock ingreso:', data);
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
    const { pedido_id, promocion_id, cliente_id, monto_descuento } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'promociones',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await movimientoService.registrarEgreso({
      tipo: 'descuento_promocion',
      empleado_id: cliente_id,
      monto: monto_descuento,
      descripcion: `Descuento aplicado promo #${promocion_id}`
    });

    console.log('✅ Flujo promoción aplicada ejecutado');
  }
};
