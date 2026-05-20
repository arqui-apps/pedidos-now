//Admin-conta Jeff. Daniel Ramos
const guardarReporte = async (data) => {
  console.log("📥 Reporte recibido:", data);

  return {
    ok: true,
    message: "Reporte guardado (modo mock)",
    data
  };
};

const obtenerReportes = async () => {
  return {
    ok: true,
    data: []
  };
};

module.exports = {
  guardarReporte,
  obtenerReportes
};
