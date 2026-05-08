require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { sequelize } = require('./src/models');

const testRoutes = require('./src/routes/test.routes');
const pagosAgentesRoutes = require('./src/routes/pagos_agentes.routes');
const reportesRoutes = require('./src/routes/reportes.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const movimientoRoutes = require('./src/routes/movimiento.routes');
const reembolsoRoutes = require('./src/routes/reembolso.routes');
const compensacionRoutes = require('./src/routes/compensacion.routes');

// Admin-contabilidad Emmanuel
const reportesRestaurantesRoutes = require('./routes/reportesRestaurantes.routes');

// Admin-conta Jeff. Daniel Ramos
const promocionesRoutes = require('./routes/promociones.routes');

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
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', testRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/pagos-agentes', pagosAgentesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/reembolsos', reembolsoRoutes);
app.use('/api/compensaciones', compensacionRoutes);

// Admin-contabilidad Emmanuel
app.use('/api/reportes-restaurantes', reportesRestaurantesRoutes);

// Admin-conta Jeff. Daniel Ramos
app.use('/admin/promociones', promocionesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Microservicio Admin/Contabilidad OK' });
});

app.get('/test-directo', (req, res) => {
  res.send('funciona');
});

app.get('/debug', (req, res) => {
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

const startServer = async () => {
  try {
    // Probar conexión a base de datos
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente.');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados con la base de datos.');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
