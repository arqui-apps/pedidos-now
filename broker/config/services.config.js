// ============================================================
// MAPA DE SERVICIOS
// Aquí defines la URL base de cada microservicio.
// Cuando tus compañeros terminen sus servicios, solo cambia
// la URL correspondiente en el archivo .env
// ============================================================

const SERVICES = {
  pedidos: {
    baseURL: process.env.PEDIDOS_URL || "http://localhost:3000/api",
    rutas: ["/pedidos", "/pedidos/:id"],
  },
  cobros: {
    baseURL: process.env.COBROS_URL || "http://localhost:3000/api",
    rutas: ["/cobros", "/cobros/:id", "/cobros/reembolsos"],
  },
  banco: {
    baseURL: process.env.BANCO_URL || "http://localhost:3000/api",
    rutas: ["/banco/cuentas", "/banco/tarjetas", "/banco/transferencia"],
  },
  repartidores: {
    baseURL: process.env.REPARTIDORES_URL || "http://localhost:3000/api",
    rutas: ["/repartidores/pedidos", "/repartidores/aceptar", "/repartidores/cuota-extra"],
  },
  paquetes: {
    baseURL: process.env.PAQUETES_URL || "http://localhost:3000/api",
    rutas: ["/paquetes", "/paquetes/confirmar"],
  },
  descuentos: {
    baseURL: process.env.DESCUENTOS_URL || "http://localhost:3000/api",
    rutas: ["/descuentos", "/descuentos/aplicar"],
  },
  movimientos: {
    baseURL: process.env.MOVIMIENTOS_URL || "http://localhost:3000/api",
    rutas: [
      "/movimientos/fondos",
      "/movimientos/ingreso-pedido",
      "/movimiento/egreso",
      "/reembolso",
      "/compensaciones",
      "/reportes/ventas",
      "/dashboard",
    ],
  },
  chats: {
    baseURL: process.env.CHATS_URL || "http://localhost:3000/api",
    rutas: ["/chats"],
  },
  soporte: {
    baseURL: process.env.SOPORTE_URL || "http://localhost:3000/api",
    rutas: ["/soporte", "/soporte/reembolso"],
  },
};

module.exports = SERVICES;
