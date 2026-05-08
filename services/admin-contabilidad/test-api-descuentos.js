//Admin-conta Jeff. Daniel Ramos
const descuentosApi = require('./src/services/descuentosApi.service');

async function test() {

  const payload = {
    cliente_id: 5,
    empresa_id: 99,
    tipo_empresa: 'RESTAURANTE',
    items: [
      {
        referencia_id: 108,
        tipo_alcance: 'PRODUCTO',
        cantidad: 2,
        precio_unitario: 45
      }
    ]
  };

  try {

    const respuesta = await descuentosApi.validarPromociones(payload);

    console.log('✅ RESPUESTA API:');
    console.log(JSON.stringify(respuesta, null, 2));

  } catch (error) {

    console.error('❌ ERROR');
  }
}

test();
