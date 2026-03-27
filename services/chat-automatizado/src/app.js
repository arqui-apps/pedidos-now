import express from 'express';
import env from './config/env.js';
import { testDatabaseConnection } from './config/database.js';

import sessionRoutes from './routes/session.routes.js';
import faqRoutes from './routes/faq.routes.js';
import compensationRoutes from './routes/compensation.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import messageRoutes from './routes/message.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import menuRoutes from './routes/menu.routes.js';
import supportRoutes from './routes/support.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Chatbot API running' });
});

app.use('/session', sessionRoutes);
app.use('/support/api/faqs', faqRoutes);
app.use('/compensation', compensationRoutes);
app.use('/message', messageRoutes);
app.use('/inquiry', inquiryRoutes);
app.use('/menu', menuRoutes);
app.use('/support', supportRoutes);

app.use(errorHandler);

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