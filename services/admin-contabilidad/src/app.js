const path = require('path');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { sequelize } = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const testRoutes = require('./routes/test.routes');
const pagosAgentesRoutes = require('./routes/pagos_agentes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const reembolsoRoutes = require('./routes/reembolso.routes');
const compensacionRoutes = require('./routes/compensacion.routes');

const bancosRoutes = require('./routes/bancos.routes');

// Admin-contabilidad Emmanuel
const reportesRestaurantesRoutes = require('./routes/reportesRestaurantes.routes');

// Admin-contabilidad Victor
const reportesNegociosRoutes = require('./routes/reportesNegocios.routes');

// Admin-contabilidad Kenneth
const reportesPaqueteriaRoutes = require('./routes/reportesPaqueteria.routes');


//Admin-conta Jeff. Daniel Ramos
const promocionesRoutes = require('./routes/promociones.routes');
const promocionesReportesRoutes = require('./routes/promocionesReportes.routes');
const cuponesRoutes = require('./routes/cupones.routes');

const initDB = require('./database/init');

const app = express();



/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Verificar estado del microservicio
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *       500:
 *         description: Error de conexión con base de datos
 */
app.get('/healthz', async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      ok: true,
      status: 'healthy',
      service: 'admin-contabilidad',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      status: 'unhealthy',
      service: 'admin-contabilidad',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Middlewares
app.use(cors({
  origin: process.env.BROKER_URL || 'http://localhost:5000',
  credentials: true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});


app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RUTAS PÚBLICAS ==========
app.use('/api/auth', require('./routes/auth.routes'));

// ========== RUTAS PROTEGIDAS ==========
app.use('/api/payments', require('./routes/cobros.routes'));
app.use('/api/bancos', bancosRoutes);
app.use('/api/compensaciones', require('./routes/compensacion.routes'));
app.use('/api/pagos-agentes', require('./routes/pagos_agentes.routes'));
app.use('/api/reembolsos', require('./routes/reembolso.routes'));
app.use('/api/movimientos', require('./routes/movimiento.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));




// Admin-contabilidad Emmanuel
app.use('/api/reportes-restaurantes', reportesRestaurantesRoutes);

// Admin-contabilidad Victor
app.use('/api/reportes-negocios', reportesNegociosRoutes);

// Admin-contabilidad Kenneth
app.use('/api/reportes-paqueteria', reportesPaqueteriaRoutes);


//Admin-conta Jeff. Daniel Ramos
app.use(promocionesRoutes);
app.use(promocionesReportesRoutes);
app.use(cuponesRoutes);

// Health check
/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta principal del microservicio
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Microservicio activo
 */
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Microservicio Admin/Contabilidad OK',
    service: 'admin-contabilidad'
  });
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
    console.log('Conexión a PostgreSQL establecida correctamente.');

    // Sincronizar modelos (crear tablas si no existen)
    await initDB();
    console.log('Tablas base verificadas.');
    
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

app.get('/api/health', (req, res) => {
    res.json({
        estado: 'OK',
        servicio: 'admin-contabilidad',
        puerto: 3000,
        timestamp: new Date().toISOString()
    });
});

startServer();

module.exports = app;