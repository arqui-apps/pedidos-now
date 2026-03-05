const { validationResult } = require('express-validator');

/**
 * Middleware para validar el resultado de las reglas de express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validación fallida',
      details: errors.array() 
    });
  }
  
  next();
};

module.exports = { validate };
