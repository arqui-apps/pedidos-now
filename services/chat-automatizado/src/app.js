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
  let dbStatus = 'ok';

  try {
    await pool.query('SELECT 1');
  } catch (e) {
    dbStatus = 'error';
  }

  const ok = dbStatus === 'ok';
  res.status(ok ? 200 : 503).json({
    status:    ok ? 'ok' : 'degraded',
    service:   'chat-automatizado',
    timestamp: new Date().toISOString()
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