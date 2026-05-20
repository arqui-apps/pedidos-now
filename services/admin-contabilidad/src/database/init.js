// Admin-contabilidad Kenneth

const db = require('../config/db');

const initDB = async () => {
  try {

    // movimiento_financiero
    await db.query(`
      CREATE TABLE IF NOT EXISTS movimiento_financiero (
        id SERIAL PRIMARY KEY,
        cuenta_id BIGINT,
        tipo VARCHAR(50),
        subtipo VARCHAR(50),
        modulo_origen VARCHAR(50),
        referencia_id BIGINT,
        monto DECIMAL(18,2),
        descripcion TEXT,
        pedido_id BIGINT,
        repartidor_id BIGINT,
        estado VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // evento_sistema
    await db.query(`
      CREATE TABLE IF NOT EXISTS evento_sistema (
        id SERIAL PRIMARY KEY,
        modulo_origen VARCHAR(50),
        tipo_evento VARCHAR(50),
        referencia_id BIGINT,
        payload JSONB,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // reembolso_cliente
    await db.query(`
    CREATE TABLE IF NOT EXISTS reembolso_cliente (
        id SERIAL PRIMARY KEY,
        usuario_ref_id BIGINT,
        pedido_id_externo BIGINT,
        motivo VARCHAR(200),
        monto DECIMAL(18,2),
        estado VARCHAR(50),
        fecha_solicitud TIMESTAMP,
        fecha_procesado TIMESTAMP,
        referencia_id BIGINT
      );
    `);
    //Compensacion_entidad 
    await db.query(`
    CREATE TABLE IF NOT EXISTS compensacion_entidad (
        id SERIAL PRIMARY KEY,
        entidad_comercial_id BIGINT,
        motivo VARCHAR(200),
        monto DECIMAL(18,2),
        estado VARCHAR(50),
        fecha_generacion TIMESTAMP,
        fecha_pago TIMESTAMP,
        referencia_id BIGINT
      );
    `);
    //cuenta fondo 
    await db.query(`
    CREATE TABLE IF NOT EXISTS cuenta_fondo (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        tipo VARCHAR(50),
        saldo DECIMAL(18,2),
        cuenta_bancaria_id BIGINT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);
    
    console.log('Base de datos lista en Neon');

  } catch (error) {
    console.error('Error inicializando BD:', error);
  }
};

module.exports = initDB;