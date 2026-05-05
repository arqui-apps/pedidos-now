// Admin-conta Jeff. Daniel Ramos

const eventos = [
  {
    tipo: 'PROMOCION_APLICADA',
    promocion_id: 1,
    nombre: '2x1 Pizza',
    descripcion: 'Promo fin de semana',
    fecha_inicio: '2026-05-01',
    fecha_fin: '2026-05-05',
    monto: 10
  },
  {
    tipo: 'PROMOCION_APLICADA',
    promocion_id: 1,
    nombre: '2x1 Pizza',
    descripcion: 'Promo fin de semana',
    fecha_inicio: '2026-05-01',
    fecha_fin: '2026-05-05',
    monto: 5
  },
  {
    tipo: 'PROMOCION_APLICADA',
    promocion_id: 2,
    nombre: 'Descuento Q20',
    descripcion: 'Primera compra',
    fecha_inicio: '2026-05-02',
    fecha_fin: '2026-05-10',
    monto: 20
  }
];

const reporte = {};

eventos.forEach(e => {
  if (e.tipo !== 'PROMOCION_APLICADA') return;

  if (!reporte[e.promocion_id]) {
    reporte[e.promocion_id] = {
      promocion_id: e.promocion_id,
      nombre: e.nombre || null,
      descripcion: e.descripcion || null,
      fecha_inicio: e.fecha_inicio || null,
      fecha_fin: e.fecha_fin || null,
      veces_usada: 0,
      total_descuento: 0
    };
  }

  reporte[e.promocion_id].veces_usada++;
  reporte[e.promocion_id].total_descuento += e.monto;
});

console.log('📊 REPORTE POR PROMOCIÓN\n');

Object.values(reporte).forEach(promo => {
  console.log(`🟢 Promoción ID: ${promo.promocion_id}`);

  if (promo.nombre) console.log(`   Nombre: ${promo.nombre}`);
  if (promo.descripcion) console.log(`   Descripción: ${promo.descripcion}`);
  if (promo.fecha_inicio) console.log(`   Inicio: ${promo.fecha_inicio}`);
  if (promo.fecha_fin) console.log(`   Fin: ${promo.fecha_fin}`);

  console.log(`   Veces usada: ${promo.veces_usada}`);
  console.log(`   Total descuento: Q${promo.total_descuento}`);
  console.log('-----------------------------');
});
