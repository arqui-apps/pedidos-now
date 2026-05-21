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
const chatAutomatizadoRoutes = require('./routes/chat_automatizado.routes');

// Admin-contabilidad Emmanuel
const reportesRestaurantesRoutes = require('./routes/reportesRestaurantes.routes');




const initDB = require('./database/init');

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.BROKER_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

// Rutas
app.use('/', testRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/pagos-agentes', pagosAgentesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/reembolsos', reembolsoRoutes);
app.use('/api/compensaciones', compesacionRoutes);
app.use('/api/chat-automatizado', chatAutomatizadoRoutes);

// Admin-contabilidad Emmanuel
app.use('/api/reportes-restaurantes', reportesRestaurantesRoutes);



// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Microservicio Admin/Contabilidad OK' });
});

app.get('/test-directo', (req, res) => {
    res.send('funciona');
});

app.get('/debug', (req, res) =>  {
    res.send('OK');
});

// Middleware de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        ok: false,
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;

(async () => {
    await initDB();

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log("Corriendo app.js de admin");
        console.log("DATABASE_URL configurada:", Boolean(process.env.DATABASE_URL));
    });
})();
