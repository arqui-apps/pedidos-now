//Admin-conta Jeff. Daniel Ramos
require('dotenv').config();

const express = require('express');
const promocionesReportesRoutes = require('./routes/promocionesReportes.routes');

const app = express();

app.use(express.json());

// SOLO TU MÓDULO
app.use('/admin/promociones/reportes', promocionesReportesRoutes);

// health
app.get('/', (req, res) => {
  res.json({ ok: true, module: 'promociones' });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 Módulo promociones corriendo en http://localhost:${PORT}`);
});