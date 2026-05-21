// Admin-contabilidad Emmanuel

const db = require('../config/db');

const crearPedidoContabilidad = async ({
  entidad_comercial_id,
  pedido_id_externo,
  tipo_pedido,
  modulo_origen,
  subtotal,
  descuento,
  comision,
  total,
  estado
}) => {
  const query = `
    INSERT INTO pedido_contabilidad (
      entidad_comercial_id,
      pedido_id_externo,
      tipo_pedido,
      modulo_origen,
      subtotal,
      descuento,
      comision,
      total,
      estado
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  const values = [
    entidad_comercial_id,
    pedido_id_externo,
    tipo_pedido,
    modulo_origen,
    subtotal,
    descuento,
    comision,
    total,
    estado
  ];
  

  const result = await db.query(query, values);
  return result.rows[0];
};
const actualizarEstadoPedidoContabilidad = async (pedido_id_externo, estado) => {
  const query = `
    UPDATE pedido_contabilidad
    SET estado = $1
    WHERE pedido_id_externo = $2
    RETURNING *
  `;

  const values = [estado, pedido_id_externo];
  const result = await db.query(query, values);

  return result.rows[0] || null;
};

// Admin-contabilidad Emmanuel
const actualizarResumenPedidoContabilidad = async ({
  pedido_id_externo,
  subtotal,
  descuento,
  comision,
  total,
  estado
}) => {
  const query = `
    UPDATE pedido_contabilidad
    SET
      subtotal = $1,
      descuento = $2,
      comision = $3,
      total = $4,
      estado = $5
    WHERE pedido_id_externo = $6
    RETURNING *
  `;

  const values = [
    subtotal,
    descuento,
    comision,
    total,
    estado,
    pedido_id_externo
  ];

  const result = await db.query(query, values);
  return result.rows[0] || null;
};
module.exports = {
  crearPedidoContabilidad,
  actualizarEstadoPedidoContabilidad,
  actualizarResumenPedidoContabilidad

};