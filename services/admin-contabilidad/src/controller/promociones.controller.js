//Admin-conta Jeff. Daniel Ramos
const descuentosApi = require('../services/descuentosApi.service');

const validarPromociones = async (req, res) => {

  try {

    const respuesta = await descuentosApi.validarPromociones(req.body);

    return res.status(200).json(respuesta);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Error validando promociones'
    });
  }
};

module.exports = {
  validarPromociones
};
