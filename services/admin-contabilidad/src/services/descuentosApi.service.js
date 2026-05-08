// Admin-contabilidad Jeff. Daniel Ramos

const axios = require('axios');

const API_DESCUENTOS = 'http://157.245.138.186:3001/api';

const validarPromociones = async (payload) => {
  try {
    const response = await axios.post(
      `${API_DESCUENTOS}/promociones/validar`,
      payload
    );

    return response.data;

  } catch (error) {
    console.error('Error conectando con descuentos:', error.message);
    throw error;
  }
};

const registrarUsoPromocion = async (payload) => {
  try {
    const response = await axios.post(
      `${API_DESCUENTOS}/promociones/aplicar`,
      payload
    );

    return response.data;

  } catch (error) {
    console.error('Error registrando promoción:', error.message);
    throw error;
  }
};

module.exports = {
  validarPromociones,
  registrarUsoPromocion
};
