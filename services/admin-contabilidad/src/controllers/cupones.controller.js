//Admin-conta Jeff. Daniel Ramos
const axios = require('axios');


// =========================
// POST /admin/cupones/lealtad
// =========================
const crearCuponLealtad = async (req, res) => {

  try {

    const body = req.body;

    const response = await axios.post(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/cupones`,
      body
    );

    res.json({
      success: true,
      data: response.data.data,
      message: response.data.message
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};


// =========================
// PATCH /admin/cupones/:id/activar
// =========================
const activarCupon = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await axios.patch(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/cupones/${id}/activar`
    );

    res.status(200).json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};

// =========================
// PATCH /admin/cupones/:id/cancelar
// =========================
const cancelarCupon = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await axios.patch(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/cupones/${id}/cancelar`
    );

    res.status(200).json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};

// =========================
// PATCH /admin/cupones/vencer
// =========================
const vencerCupones = async (req, res) => {

  try {

    const response = await axios.patch(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/cupones/vencer`
    );

    res.status(200).json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};

// =========================
// GET /admin/cupones/:id
// =========================
const getCuponById = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/cupones/${id}`
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};


// =========================
// GET /admin/cupones/codigo/:codigo
// =========================
const getCuponByCodigo = async (req, res) => {

  try {

    const { codigo } = req.params;

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/cupones/codigo/${codigo}`
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};

module.exports = {
  crearCuponLealtad,
  activarCupon,
  cancelarCupon,
  vencerCupones,
  getCuponById,
  getCuponByCodigo
};