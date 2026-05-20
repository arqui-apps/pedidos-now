CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),

    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    tipo_usuario VARCHAR(50) NOT NULL,
    rol VARCHAR(50) NOT NULL,

    estado VARCHAR(50) DEFAULT 'activo',

    telefono VARCHAR(20),

    otros_datos JSONB,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);