const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servicio de Paquetería funcionando');
});

// Rutas de API centralizadas
app.use('/api', require('./routes'));

module.exports = app;