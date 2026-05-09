//Admin-conta Jeff. Daniel Ramos
const { PromocionReporte } = require('../models');

// 💾 Guardar reporte de promoción
const guardarReporte = async (req, res) => {
  try {
    const {
      cliente_id,
      promocion_id,
      pedido_id,
      empresa_id,
      monto_descuento
    } = req.body;

    // Validación mínima
    if (!cliente_id || !promocion_id || !pedido_id || !empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios'
      });
    }

    const nuevoReporte = await PromocionReporte.create({
      cliente_id,
      promocion_id,
      pedido_id,
      empresa_id,
      monto_descuento: monto_descuento || 0
    });

    return res.json({
      success: true,
      message: 'Reporte guardado correctamente',
      data: nuevoReporte
    });

  } catch (error) {
    console.error('Error guardando reporte:', error.message);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 📊 Obtener todos los reportes
const obtenerReportes = async (req, res) => {
  try {
    const reportes = await PromocionReporte.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: reportes
    });

  } catch (error) {
    console.error('Error obteniendo reportes:', error.message);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  guardarReporte,
  obtenerReportes
};
