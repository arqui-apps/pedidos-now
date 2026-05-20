const env = require('./env');

module.exports = {
  COBROS_SERVICE_URL: process.env.COBROS_SERVICE_URL || 'http://localhost:3005',
  SISTEMA_BANCARIO_URL: process.env.SISTEMA_BANCARIO_URL || 'http://localhost:3001',
  BROKER_URL: process.env.BROKER_URL || 'http://localhost:5000',
  
  endpoints: {
    cobros: {
      getCobros: '/api/payments',
      getCobrosEnRango: '/api/payments',
      getMultas: '/api/payments',
      procesarCobro: '/api/payments'
    },
    bancario: {
      transferencia: '/api/transfers',
      consultarSaldo: '/api/accounts',
      obtenerCuenta: '/api/accounts'
    },
    broker: {
      validate: '/api/auth/validate'
    }
  }
};