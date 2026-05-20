//Admin-conta Jeff. Daniel Ramos    
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});
const express = require('express');
const app = express();

app.use(express.json());

const promocionesRoutes = require('./routes/promociones.routes');
const cuponesRoutes = require('./routes/cupones.routes');

app.use('/', promocionesRoutes);
app.use('/', cuponesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});