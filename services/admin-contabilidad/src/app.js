require('dotenv').config();
const express = require('express');
const testRoutes = require('./routes/test.routes');
const pagosAgentesRoutes = require('./routes/pagos_agentes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const reembolsoRoutes = require('./routes/reembolso.route');
const compesacionRoutes = require('./routes/compensacion.routes');

const app = express();
app.use(express.json());

app.use('/', testRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/pagos-agentes', pagosAgentesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/reembolsos', reembolsoRoutes);
app.use('/api/compensaciones', compesacionRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Microservicio Admin/Contabilidad OK' });
});

app.get('/test-directo', (req, res) => {
    res.send('funciona');
});

app.get('/debug', (req, res) =>  {
    res.send('OK');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

console.log ("Corriendo app.js de admin");

console.log(process.env.DB_USER);

console.log("Prueba de escritura 1");

console.log("Prueba de escritura 2");

console.log("Prueba de AndreiHarkovLev");