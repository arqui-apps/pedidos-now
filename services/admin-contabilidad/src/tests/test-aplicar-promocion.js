//Admin-conta Jeff. Daniel Ramos
const descuentosApi = require('../services/descuentosApi.service');

async function test() {

  const payload = {
    promocion_id: 1,
    cliente_id: 5,
    pedido_id: 999,
    monto_descuento: 25
  };

  try {

    const respuesta = await descuentosApi.registrarUsoPromocion(payload);

    console.log('✅ RESPUESTA API:');
    console.log(JSON.stringify(respuesta, null, 2));

  } catch (error) {

    console.error('❌ ERROR');

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

test();
