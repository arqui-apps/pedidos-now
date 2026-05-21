// Admin-contabilidad Emmanuel

const db = require('../config/db');

const obtenerPorEntidadExterna = async (entidad_id_externo, tipo) => {
  const query = `
    SELECT id, entidad_id_externo, nombre_comercial, tipo, activo
    FROM entidad_comercial
    WHERE entidad_id_externo = $1
      AND tipo = $2
      AND activo = TRUE
    LIMIT 1
  `;

  const values = [entidad_id_externo, tipo];
  const result = await db.query(query, values);

  return result.rows[0] || null;
};

module.exports = {
  obtenerPorEntidadExterna
};