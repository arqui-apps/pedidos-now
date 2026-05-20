const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    console.log("HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];

    console.log("TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado',
      detalle: error.message
    });
  }
};

module.exports = {
  verificarToken
};