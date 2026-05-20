const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const result = await authService.registrar(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(401).json({
      ok: false,
      error: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.obtenerPorId(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await authService.actualizar(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe
};