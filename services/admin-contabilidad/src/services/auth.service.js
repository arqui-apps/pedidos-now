const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const SALT_ROUNDS = 10;

async function registrar(userData) {
  const { nombre, apellidos, email, password, tipo_usuario, telefono } = userData;

  if (!nombre || !email || !password || !tipo_usuario) {
    throw new Error('Campos requeridos');
  }

  const existe = await pool.query(
    'SELECT id FROM usuario WHERE email = $1',
    [email]
  );

  if (existe.rows.length > 0) {
    throw new Error('Email ya registrado');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO usuario 
    (nombre, apellidos, email, password_hash, tipo_usuario, rol, estado, telefono)
    VALUES ($1,$2,$3,$4,$5,$6,'activo',$7)
    RETURNING id, nombre, email, tipo_usuario, rol`,
    [
      nombre,
      apellidos || null,
      email,
      hash,
      tipo_usuario,
      tipo_usuario,
      telefono || null
    ]
  );

  const usuario = result.rows[0];

  const token = jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: '24h' });

  return { ok: true, usuario, token };
}

async function login(email, password) {
  const result = await pool.query(
    'SELECT * FROM usuario WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    ok: true,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    },
    token
  };
}

async function obtenerPorId(id) {
  const result = await pool.query(
    'SELECT id, nombre, email, rol FROM usuario WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function actualizar(id, datos) {
  const { nombre, telefono } = datos;

  await pool.query(
    `UPDATE usuario 
     SET nombre = $1, telefono = $2 
     WHERE id = $3`,
    [nombre, telefono, id]
  );

  return obtenerPorId(id);
}

module.exports = {
  registrar,
  login,
  obtenerPorId,
  actualizar
};