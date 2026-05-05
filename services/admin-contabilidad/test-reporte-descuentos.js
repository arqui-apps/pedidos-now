// Admin-conta Jeff. Daniel Ramos

const eventosSimulados = [
  {
    tipo: 'PROMOCION_APLICADA',
    data: {
      pedido_id: 1,
      promocion_id: 10,
      cliente_id: 5,
      monto_descuento: 10,
      tipo: 'cupon',
      nombre: 'Promo Verano'
    }
  },
  {
    tipo: 'PROMOCION_APLICADA',
    data: {
      pedido_id: 2,
      promocion_id: 11,
      cliente_id: 8,
      monto_descuento: 20,
      tipo: 'flash'
    }
  }
];

const generarReporte = (eventos) => {
  let total = 0;
  const porTipo = {};
  const promociones = [];

  eventos.forEach(e => {
    if (e.tipo === 'PROMOCION_APLICADA') {
      const d = e.data;

      total += d.monto_descuento;

      // contar por tipo
      const tipo = d.tipo || 'desconocido';
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;

      promociones.push({
        promocion_id: d.promocion_id,
        nombre: d.nombre || null,
        descripcion: d.descripcion || null,
        tipo,
        pedido_id: d.pedido_id,
        cliente_id: d.cliente_id,
        monto_descuento: d.monto_descuento,
        fecha_aplicacion: d.fecha_aplicacion || new Date().toISOString(),
        fecha_inicio: d.fecha_inicio || null,
        fecha_fin: d.fecha_fin || null
      });
    }
  });

  return {
    total_promociones_aplicadas: promociones.length,
    total_descuento: total,
    por_tipo: porTipo,
    promociones
  };
};

const reporte = generarReporte(eventosSimulados);

console.log('📊 REPORTE DE PROMOCIONES');
console.log(JSON.stringify(reporte, null, 2));
