const authService = require('../services/auth.service');

/**
 * Middleware para verificar autenticación
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }
    
    const token = authHeader.substring(7);
    const userData = await authService.validateToken(token);
    
    // Adjuntar datos del usuario al request
    req.user = userData;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      details: error.message
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para esta acción' 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
