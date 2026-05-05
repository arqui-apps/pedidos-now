//Admin-conta Jeff. Daniel Ramos
const repo = require('../repositories/promocion.repository');

exports.registrarPromocionAplicada = async (data) => {
  await repo.crearRegistro(data);
};
