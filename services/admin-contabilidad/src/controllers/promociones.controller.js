//Admin-conta Jeff. Daniel Ramos
console.log("PROMOCIONES_SERVICE_URL =", process.env.PROMOCIONES_SERVICE_URL);

const axios = require('axios');
const pool = require('../db');


// ===============================
// POST /admin/promociones/reportes
// ===============================
const syncPromociones = async (req, res) => {

  try {

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones`
    );

    const promociones = response.data.data;

    for (const p of promociones) {

      await pool.query(
        `INSERT INTO reportes_promociones
        (promocion_id, nombre, tipo_descuento, valor_descuento, estado)
        VALUES ($1, $2, $3, $4, $5)`,

        [
          p.id,
          p.nombre,
          p.tipo_descuento,
          p.valor_descuento,
          p.estado
        ]
      );

    }

    res.json({
      message: "Promociones sincronizadas"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


// ===============================
// GET /admin/promociones/reportes
// ===============================
const getReportes = async (req, res) => {

  try {

    const result = await pool.query(
      'SELECT * FROM reportes_promociones ORDER BY id DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};


// =========================
// POST /admin/promociones/flash
// =========================
const crearPromocionFlash = async (req, res) => {

  try {

    const body = req.body;

    const response = await axios.post(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones-flash`,
      body
    );

    res.status(201).json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

};

// =========================
// GET /admin/promociones/flash
// =========================
const getPromocionesFlash = async (req, res) => {

  try {

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones-flash`
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
// GET /admin/promociones/flash/:id
// =========================
const getPromocionFlashById = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones-flash/${id}`
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
// GET /admin/promociones/flash/vigentes
// =========================
const getPromocionesFlashVigentes = async (req, res) => {

  try {

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones-flash/vigentes`
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
// GET /admin/promociones
// =========================
const getPromociones = async (req, res) => {

  try {

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones`
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
// PATCH /admin/promociones/:id/estado
// =========================
const cambiarEstadoPromocion = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await axios.patch(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones/${id}/estado`,
      req.body
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
// GET /admin/promociones/:id
// =========================
const getPromocionById = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.PROMOCIONES_SERVICE_URL}/api/promociones/${id}`
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
// EXPORTS
// =========================
module.exports = {
  syncPromociones,
  getReportes,
  crearPromocionFlash,
  getPromocionesFlash,
  getPromocionFlashById,
  getPromocionesFlashVigentes,
  getPromociones,   
  cambiarEstadoPromocion,
  getPromocionById
};