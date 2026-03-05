const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const { errorMiddleware } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'restaurantes-service' });
});

// Routes
app.use('/api', routes);

// Error handling (debe ir al final)
app.use(errorMiddleware);

module.exports = app;
