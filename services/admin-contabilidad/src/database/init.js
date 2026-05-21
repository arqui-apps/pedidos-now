// Admin-contabilidad Kenneth

const db = require('../config/db');

const statements = [
    `CREATE TABLE IF NOT EXISTS movimiento_financiero (
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
    );`,
    `CREATE TABLE IF NOT EXISTS evento_sistema (
        id SERIAL PRIMARY KEY,
        modulo_origen VARCHAR(50),
        tipo_evento VARCHAR(50),
        referencia_id BIGINT,
        payload JSONB,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS reembolso_cliente (
        id SERIAL PRIMARY KEY,
        usuario_ref_id BIGINT,
        pedido_id_externo BIGINT,
        motivo VARCHAR(200),
        monto DECIMAL(18,2),
        estado VARCHAR(50),
        fecha_solicitud TIMESTAMP,
        fecha_procesado TIMESTAMP,
        referencia_id BIGINT
    );`,
    `CREATE TABLE IF NOT EXISTS compensacion_entidad (
        id SERIAL PRIMARY KEY,
        entidad_comercial_id BIGINT,
        motivo VARCHAR(200),
        monto DECIMAL(18,2),
        estado VARCHAR(50),
        fecha_generacion TIMESTAMP,
        fecha_pago TIMESTAMP,
        referencia_id BIGINT
    );`,
    `CREATE TABLE IF NOT EXISTS cuenta_fondo (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        tipo VARCHAR(50),
        saldo DECIMAL(18,2),
        cuenta_bancaria_id BIGINT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_sesion_resumen (
        id BIGSERIAL PRIMARY KEY,
        id_session_externo BIGINT NOT NULL UNIQUE,
        id_usuario_externo BIGINT NOT NULL,
        user_type VARCHAR(20) NOT NULL,
        current_state VARCHAR(50),
        previous_state VARCHAR(50),
        chat_context JSONB,
        session_status VARCHAR(20) DEFAULT 'active',
        resolution VARCHAR(40),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        is_active SMALLINT DEFAULT 1,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_mensaje_historial (
        id BIGSERIAL PRIMARY KEY,
        id_mensaje_externo BIGINT UNIQUE,
        id_session_externo BIGINT NOT NULL,
        message_sender VARCHAR(30) NOT NULL,
        message_content TEXT,
        sent_time TIMESTAMP,
        is_active SMALLINT DEFAULT 1,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_compensacion (
        id BIGSERIAL PRIMARY KEY,
        id_compensacion_externo BIGINT UNIQUE,
        id_usuario_externo BIGINT,
        id_session_externo BIGINT,
        amount DECIMAL(10,2),
        cupon_code VARCHAR(100),
        expiration_date TIMESTAMP,
        reason TEXT,
        compensation_type VARCHAR(20),
        compensation_status VARCHAR(20) DEFAULT 'pendiente',
        is_active SMALLINT DEFAULT 1,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_support_request (
        id BIGSERIAL PRIMARY KEY,
        id_support_request_externo BIGINT UNIQUE,
        id_delivery_externo BIGINT,
        id_pedido_externo BIGINT,
        id_session_externo BIGINT,
        id_problem_externo BIGINT,
        request_status VARCHAR(20) DEFAULT 'pendiente',
        problem_details TEXT,
        is_active SMALLINT DEFAULT 1,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_order_inquiry (
        id BIGSERIAL PRIMARY KEY,
        id_inquiry_externo BIGINT UNIQUE,
        id_session_externo BIGINT NOT NULL,
        inquiry_type VARCHAR(20) NOT NULL,
        input_value VARCHAR(100) NOT NULL,
        inquiry_time TIMESTAMP,
        result_found SMALLINT DEFAULT 0,
        is_active SMALLINT DEFAULT 1,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_payload_auditoria (
        id BIGSERIAL PRIMARY KEY,
        entity_type VARCHAR(20) NOT NULL,
        external_id BIGINT,
        id_session_externo BIGINT,
        id_usuario_externo BIGINT,
        raw_payload JSONB NOT NULL,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_chat_payload_externo UNIQUE (entity_type, external_id)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_chat_sesion_usuario
        ON chat_sesion_resumen (id_usuario_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_sesion_estado
        ON chat_sesion_resumen (session_status, resolution);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_sesion_fecha
        ON chat_sesion_resumen (start_time, end_time);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_mensaje_sesion
        ON chat_mensaje_historial (id_session_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_mensaje_fecha
        ON chat_mensaje_historial (sent_time);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_compensacion_usuario
        ON chat_compensacion (id_usuario_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_compensacion_sesion
        ON chat_compensacion (id_session_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_compensacion_estado
        ON chat_compensacion (compensation_type, compensation_status);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_support_sesion
        ON chat_support_request (id_session_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_support_pedido
        ON chat_support_request (id_pedido_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_support_estado
        ON chat_support_request (request_status);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_inquiry_sesion
        ON chat_order_inquiry (id_session_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_inquiry_tipo
        ON chat_order_inquiry (inquiry_type);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_inquiry_fecha
        ON chat_order_inquiry (inquiry_time);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_payload_sesion
        ON chat_payload_auditoria (id_session_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_payload_usuario
        ON chat_payload_auditoria (id_usuario_externo);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_payload_tipo
        ON chat_payload_auditoria (entity_type);`,
    `CREATE OR REPLACE VIEW vw_chat_reporte_cliente AS
        SELECT
            s.id_usuario_externo,
            s.user_type,
            s.id_session_externo,
            s.current_state,
            s.previous_state,
            s.session_status,
            s.resolution,
            s.start_time,
            s.end_time,
            CASE
                WHEN s.start_time IS NOT NULL AND s.end_time IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 60.0
                ELSE NULL
            END AS minutos_resolucion,
            COALESCE(m.total_mensajes, 0) AS total_mensajes,
            COALESCE(c.total_compensaciones, 0) AS total_compensaciones,
            COALESCE(c.monto_compensaciones, 0) AS monto_compensaciones,
            COALESCE(sr.total_soporte, 0) AS total_soporte,
            COALESCE(oi.total_consultas, 0) AS total_consultas,
            COALESCE(pa.total_payloads_recibidos, 0) AS total_payloads_recibidos
        FROM chat_sesion_resumen s
        LEFT JOIN (
            SELECT id_session_externo, COUNT(*) AS total_mensajes
            FROM chat_mensaje_historial
            GROUP BY id_session_externo
        ) m ON m.id_session_externo = s.id_session_externo
        LEFT JOIN (
            SELECT
                id_session_externo,
                COUNT(*) AS total_compensaciones,
                SUM(COALESCE(amount, 0)) AS monto_compensaciones
            FROM chat_compensacion
            GROUP BY id_session_externo
        ) c ON c.id_session_externo = s.id_session_externo
        LEFT JOIN (
            SELECT id_session_externo, COUNT(*) AS total_soporte
            FROM chat_support_request
            GROUP BY id_session_externo
        ) sr ON sr.id_session_externo = s.id_session_externo
        LEFT JOIN (
            SELECT id_session_externo, COUNT(*) AS total_consultas
            FROM chat_order_inquiry
            GROUP BY id_session_externo
        ) oi ON oi.id_session_externo = s.id_session_externo
        LEFT JOIN (
            SELECT id_session_externo, COUNT(*) AS total_payloads_recibidos
            FROM chat_payload_auditoria
            GROUP BY id_session_externo
        ) pa ON pa.id_session_externo = s.id_session_externo;`
];

const initDB = async () => {
    try {
        for (const statement of statements) {
            await db.query(statement);
        }

        console.log('Base de datos lista en Neon');
    } catch (error) {
        console.error('Error inicializando BD:', error);
    }
};

module.exports = initDB;
