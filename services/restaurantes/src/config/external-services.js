const env = require('./env');

module.exports = {
  AUTH_SERVICE_URL: env.AUTH_SERVICE_URL,
  BROKER_SERVICE_URL: env.BROKER_SERVICE_URL,
  DESCUENTOS_SERVICE_URL: env.DESCUENTOS_SERVICE_URL,
  COBROS_SERVICE_URL: env.COBROS_SERVICE_URL,
  
  endpoints: {
    auth: {
      validate: '/api/auth/validate'
    },
    broker: {
      notifyPedido: '/api/pedidos/notify'
    },
    descuentos: {
      getPromociones: '/api/promociones',
      validateDescuento: '/api/descuentos/validate'
    },
    cobros: {
      aplicarMulta: '/api/multas',
      procesarCobro: '/api/cobros'
    }
  }
};
