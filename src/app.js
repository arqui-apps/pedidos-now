const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ruta que maneja las rutas MD.
app.use('/api', require('./routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servicio de Paquetería funcionando');
});

module.exports = app;