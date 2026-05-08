require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const testRoutes = require('./routes/test.routes');
const pagosAgentesRoutes = require('./routes/pagos_agentes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const reembolsoRoutes = require('./routes/reembolso.routes');
const compesacionRoutes = require('./routes/compensacion.routes');

const promocionesRoutes = require('./routes/promociones.routes');

const app = express();
//Middlewares de seguridad, logging y compresión
app.use(cors({
    origin: process.env.BROKER_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

app.use('/', testRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/pagos-agentes', pagosAgentesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/reembolsos', reembolsoRoutes);
app.use('/api/compensaciones', compesacionRoutes);

app.use('/admin/promociones', promocionesRoutes);
//Health check
app.get('/', (req, res) => {
    res.json({ message: 'Microservicio Admin/Contabilidad OK' });
});

app.get('/test-directo', (req, res) => {
    res.send('funciona');
});

app.get('/debug', (req, res) =>  {
    res.send('OK');
});

//Verificación de errores del middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        ok: false,
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

//Inicio del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

console.log(process.env.DB_USER);
