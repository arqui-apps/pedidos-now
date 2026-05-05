//Admin-conta Jeff. Daniel Ramos
const db = require('../config/db');

const crearRegistroPromocion = async ({
  pedido_id,
  cliente_id,
  promocion_id,
  tipo_alcance,
  referencia_id,
  monto_descuento
}) => {
  const query = `
    INSERT INTO promociones_contabilidad (
      pedido_id,
      cliente_id,
      promocion_id,
      tipo_alcance,
      referencia_id,
      monto_descuento
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;

  const values = [
    pedido_id,
    cliente_id,
    promocion_id,
    tipo_alcance,
    referencia_id,
    monto_descuento
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  crearRegistroPromocion
};
