//Admin-conta Jeff. Daniel Ramos
const descuentosApi = require('../services/descuentosApi.service');

const aplicarPromocion = async (req, res) => {
  try {

    const respuesta = await descuentosApi.registrarUsoPromocion(req.body);

    res.json(respuesta);

  } catch (error) {

    console.error(error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  aplicarPromocion
};
