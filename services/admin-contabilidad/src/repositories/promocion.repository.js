//Admin-conta Jeff. Daniel Ramos
const { pool } = require('../config/db');

exports.crearRegistro = async (data) => {
  const query = `
    INSERT INTO promociones_contabilidad (
      pedido_id,
      cliente_id,
      promocion_id,
      tipo,
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      fecha_aplicacion,
      monto_descuento
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `;

  const values = [
    data.pedido_id,
    data.cliente_id,
    data.promocion_id,
    data.tipo,
    data.nombre,
    data.descripcion,
    data.fecha_inicio,
    data.fecha_fin,
    data.fecha_aplicacion,
    data.monto_descuento
  ];

  await pool.query(query, values);
};
