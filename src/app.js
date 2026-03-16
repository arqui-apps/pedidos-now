const express = require('express');
const cors = require('cors');

const app = express();

// Imports de rutas
const courierStatusRoutes = require('./routes/courier_status.routes');

// Middlewares
app.use(cors());
app.use(express.json());

// ruta que maneja las rutas MD.
app.use('/api', require('./routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servicio de Paquetería funcionando');
});

// Rutas de API
app.use('/api', courierStatusRoutes);

module.exports = app;