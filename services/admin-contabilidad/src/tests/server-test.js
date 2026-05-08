//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const promocionesRoutes = require('../routes/promociones.routes');

const app = express();

app.use(express.json());

app.use('/admin/promociones', promocionesRoutes);

app.listen(3000, () => {
  console.log('Servidor test en puerto 3000');
});
