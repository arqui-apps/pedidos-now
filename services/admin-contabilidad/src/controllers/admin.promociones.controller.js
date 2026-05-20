import axios from "axios";

const baseURL = process.env.PROMOCIONES_SERVICE_URL;

// POST /admin/promociones/reportes
export const crearReportePromociones = async (req, res) => {
  try {
    const response = await axios.post(
      `${baseURL}/api/promociones/reportes`,
      req.body
    );

    return res.status(201).json(response.data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creando reporte de promociones",
      error: error.message,
    });
  }
};

// GET /admin/promociones/reportes
export const obtenerReportesPromociones = async (req, res) => {
  try {
    const response = await axios.get(
      `${baseURL}/api/promociones/reportes`,
      { params: req.query }
    );

    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo reportes",
      error: error.message,
    });
  }
};