const { sequelize } = require('../config/db');

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
}, transaction = null) => {
  const result = await sequelize.query(
    `INSERT INTO pedido_contabilidad (
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

    VALUES (
    :entidad_comercial_id,
    :pedido_id_externo,
    :tipo_pedido,
    :modulo_origen,
    :subtotal,
    :descuento,
    :comision,
    :total,
    :estado
)
RETURNING id`,
{
  replacements: {
    entidad_comercial_id,
    pedido_id_externo,
    tipo_pedido,
    modulo_origen,
    subtotal,
    descuento,
    comision,
    total,
    estado
  },
  type: sequelize.QueryTypes.INSERT,
  transaction
}
);

return result[0][0].id;
};

const actualizarEstadoPedidoContabilidad =
async (
    pedido_id_externo,
    estado,
    modulo_origen = null,
    transaction = null
) => {

const result = await sequelize.query(
`
UPDATE pedido_contabilidad
SET estado = :estado
WHERE pedido_id_externo = :pedido_id_externo
AND (
    :modulo_origen IS NULL
    OR modulo_origen = :modulo_origen
)
RETURNING *
`,
{
  replacements: {
    estado,
    pedido_id_externo,
    modulo_origen
  },
  type: sequelize.QueryTypes.UPDATE,
  transaction
}
);

return result[0][0] || null;
};

const actualizarResumenPedidoContabilidad = async ({
  pedido_id_externo,
  subtotal,
  descuento,
  comision,
  total,
estado,
  modulo_origen = null
}, transaction = null) => {

const result = await sequelize.query(
`
UPDATE pedido_contabilidad
SET
  subtotal = :subtotal,
  descuento = :descuento,
  comision = :comision,
  total = :total,
  estado = :estado
WHERE pedido_id_externo = :pedido_id_externo
AND (
    :modulo_origen IS NULL
    OR modulo_origen = :modulo_origen
)
RETURNING *
`,
{
  replacements: {
    subtotal,
    descuento,
    comision,
    total,
    estado,
    pedido_id_externo,
    modulo_origen
  },
  type: sequelize.QueryTypes.UPDATE,
  transaction
}
);

return result[0][0] || null;
};

module.exports = {
  crearPedidoContabilidad,
  actualizarEstadoPedidoContabilidad,
  actualizarResumenPedidoContabilidad
};