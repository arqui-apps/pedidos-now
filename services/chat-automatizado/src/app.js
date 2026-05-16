import express from 'express';
import { setupSwagger } from './config/swagger.js';
import cors from 'cors';
import env from './config/env.js';
import { testDatabaseConnection, default as pool } from './config/database.js';

import sessionRoutes from './routes/session.routes.js';
import faqRoutes from './routes/faq.routes.js';
import compensationRoutes from './routes/compensation.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import messageRoutes from './routes/message.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import menuRoutes from './routes/menu.routes.js';
import supportRoutes from './routes/support.routes.js';
import escalationRoutes from './routes/escalation.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Chatbot API running', version: '1.0.0' });
});

app.get('/health', async (req, res) => {
  const checks = {};

  // DB check
  try {
    await pool.query('SELECT 1');
    checks.database = { status: 'ok' };
  } catch (e) {
    checks.database = { status: 'error', message: e.message };
  }

  // External services check (solo ping, no bloquea si fallan)
  const services = {
    auth:       process.env.AUTH_SERVICE_URL       || 'http://localhost:3001',
    pedidos:    process.env.RESTAURANTS_SERVICE_URL || 'http://localhost:3002',
    descuentos: process.env.DESCUENTOS_SERVICE_URL  || 'http://localhost:3005',
    cobros:     process.env.COBROS_SERVICE_URL       || 'http://localhost:3006',
  };

  for (const [name, baseUrl] of Object.entries(services)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch(`${baseUrl}/health`, { signal: controller.signal })
        .catch(() => null);
      clearTimeout(timeout);
      checks[name] = { status: resp ? 'ok' : 'unavailable', url: baseUrl };
    } catch {
      checks[name] = { status: 'unavailable', url: baseUrl };
    }
  }

  const allOk = checks.database?.status === 'ok';
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    service: 'chat-automatizado',
    timestamp: new Date().toISOString(),
    checks,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/session', sessionRoutes);
app.use('/support/api/faqs', faqRoutes);
app.use('/compensation', compensationRoutes);
app.use('/message', messageRoutes);
app.use('/inquiry', inquiryRoutes);
app.use('/menu', menuRoutes);
app.use('/support', supportRoutes);
app.use('/escalation', escalationRoutes);

app.use(errorHandler);

// ── Swagger ───────────────────────────────────────────────────────────────────
setupSwagger(app);

const startServer = async () => {
  try {
    await testDatabaseConnection();
    console.log('Database connected');

    app.listen(env.port, () => {
      console.log(`Chatbot service running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
  }
};

startServer();

export default app;