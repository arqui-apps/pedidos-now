// Admin-conta Jeff. Daniel Ramos Reportes
const eventos = [
  { tipo: 'PROMOCION_APLICADA', monto: 10 },
  { tipo: 'PROMOCION_APLICADA', monto: 15 },
  { tipo: 'PROMOCION_CANCELADA', monto: 5 },
  { tipo: 'PROMOCION_APLICADA', monto: 20 }
];

let totalDescuentos = 0;
let totalReversiones = 0;
let cantidadPromos = 0;

eventos.forEach(e => {
  if (e.tipo === 'PROMOCION_APLICADA') {
    totalDescuentos += e.monto;
    cantidadPromos++;
  }

  if (e.tipo === 'PROMOCION_CANCELADA') {
    totalReversiones += e.monto;
  }
});

console.log('📊 REPORTE DE DESCUENTOS');
console.log('Total descuentos aplicados:', totalDescuentos);
console.log('Total reversiones:', totalReversiones);
console.log('Cantidad de promociones:', cantidadPromos);
