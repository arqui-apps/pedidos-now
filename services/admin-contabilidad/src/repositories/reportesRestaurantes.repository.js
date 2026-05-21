// Admin-contabilidad Emmanuel

const db = require('../config/db');

const obtenerResumenPorRestaurante = async () => {
  const query = `
    SELECT
      ec.id AS entidad_comercial_id,
      ec.nombre_comercial,
      ec.entidad_id_externo,
      COUNT(pc.id) AS total_pedidos,
      COALESCE(SUM(CASE WHEN pc.estado = 'completado' THEN 1 ELSE 0 END), 0) AS pedidos_completados,
      COALESCE(SUM(CASE WHEN pc.estado = 'cancelado' THEN 1 ELSE 0 END), 0) AS pedidos_cancelados,
      COALESCE(SUM(CASE WHEN pc.estado = 'cancelado_con_multa' THEN 1 ELSE 0 END), 0) AS pedidos_cancelados_con_multa,
      COALESCE(SUM(pc.subtotal), 0) AS subtotal_acumulado,
      COALESCE(SUM(pc.descuento), 0) AS descuento_acumulado,
      COALESCE(SUM(pc.comision), 0) AS comision_acumulada,
      COALESCE(SUM(pc.total), 0) AS total_neto
    FROM pedido_contabilidad pc
    INNER JOIN entidad_comercial ec
      ON ec.id = pc.entidad_comercial_id
    WHERE ec.tipo = 'restaurante'
    GROUP BY ec.id, ec.nombre_comercial, ec.entidad_id_externo
    ORDER BY total_neto DESC
  `;

  const result = await db.query(query);
  return result.rows;
};
// Admin-contabilidad Emmanuel
const obtenerResumenPorEntidadComercial = async (entidadComercialId) => {
  const query = `
    SELECT
      ec.id AS entidad_comercial_id,
      ec.nombre_comercial,
      ec.entidad_id_externo,
      COUNT(pc.id) AS total_pedidos,
      COALESCE(SUM(CASE WHEN pc.estado = 'completado' THEN 1 ELSE 0 END), 0) AS pedidos_completados,
      COALESCE(SUM(CASE WHEN pc.estado = 'cancelado' THEN 1 ELSE 0 END), 0) AS pedidos_cancelados,
      COALESCE(SUM(CASE WHEN pc.estado = 'cancelado_con_multa' THEN 1 ELSE 0 END), 0) AS pedidos_cancelados_con_multa,
      COALESCE(SUM(pc.subtotal), 0) AS subtotal_acumulado,
      COALESCE(SUM(pc.descuento), 0) AS descuento_acumulado,
      COALESCE(SUM(pc.comision), 0) AS comision_acumulada,
      COALESCE(SUM(pc.total), 0) AS total_neto
    FROM pedido_contabilidad pc
    INNER JOIN entidad_comercial ec
      ON ec.id = pc.entidad_comercial_id
    WHERE ec.tipo = 'restaurante'
      AND ec.id = $1
    GROUP BY ec.id, ec.nombre_comercial, ec.entidad_id_externo
  `;

  const result = await db.query(query, [entidadComercialId]);
  return result.rows[0] || null;
};
// Admin-contabilidad Emmanuel
const obtenerResumenCancelacionesYMultas = async () => {
  const query = `
    SELECT
      ec.id AS entidad_comercial_id,
      ec.nombre_comercial,
      ec.entidad_id_externo,
      COALESCE(SUM(CASE WHEN pc.estado = 'cancelado' THEN 1 ELSE 0 END), 0) AS pedidos_cancelados,
      COALESCE(SUM(CASE WHEN pc.estado = 'cancelado_con_multa' THEN 1 ELSE 0 END), 0) AS pedidos_cancelados_con_multa,
      COALESCE(SUM(CASE WHEN mf.tipo = 'egreso' AND mf.subtipo = 'cancelacion_restaurante' THEN mf.monto ELSE 0 END), 0) AS total_reembolsos_cancelacion,
      COALESCE(SUM(CASE WHEN mf.tipo = 'ingreso' AND mf.subtipo = 'multa_cancelacion_restaurante' THEN mf.monto ELSE 0 END), 0) AS total_multas_cancelacion
    FROM entidad_comercial ec
    LEFT JOIN pedido_contabilidad pc
      ON pc.entidad_comercial_id = ec.id
    LEFT JOIN movimiento_financiero mf
      ON mf.referencia_id = ec.entidad_id_externo
     AND mf.modulo_origen = 'restaurantes'
    WHERE ec.tipo = 'restaurante'
    GROUP BY ec.id, ec.nombre_comercial, ec.entidad_id_externo
    ORDER BY total_multas_cancelacion DESC, pedidos_cancelados_con_multa DESC
  `;

  const result = await db.query(query);
  return result.rows;
};

module.exports = {
    
    obtenerResumenPorRestaurante,
    obtenerResumenPorEntidadComercial,
    obtenerResumenCancelacionesYMultas
};