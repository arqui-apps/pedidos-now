//Admin-conta Jeff. DAniel Ramos
const axios = require('axios');

const BASE_URL = process.env.PROMOCIONES_SERVICE_URL;

const crearCuponLealtad = async (data) => {
  const response = await axios.post(
    `${BASE_URL}/api/cupones`,
    data
  );
  return response.data;
};

const obtenerPromociones = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/promociones`
  );
  return response.data;
};

module.exports = {
  crearCuponLealtad,
  obtenerPromociones
};