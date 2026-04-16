CREATE TABLE IF NOT EXISTS chat_sesion_resumen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_session_externo BIGINT NOT NULL,
    id_usuario_externo BIGINT NOT NULL,
    user_type ENUM('cliente', 'repartidor', 'negocio') NOT NULL,
    current_state VARCHAR(50) NULL,
    previous_state VARCHAR(50) NULL,
    chat_context JSON NULL,
    session_status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    resolution ENUM(
        'resuelto',
        'resuelto_con_cupon',
        'resuelto_con_reembolso',
        'escalado_a_agente',
        'cerrado_sin_resolver'
    ) NULL,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    is_active TINYINT DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_chat_sesion_externa (id_session_externo),
    KEY idx_chat_sesion_usuario (id_usuario_externo),
    KEY idx_chat_sesion_estado (session_status, resolution)
);

CREATE TABLE IF NOT EXISTS chat_mensaje_historial (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_mensaje_externo BIGINT NULL,
    id_session_externo BIGINT NOT NULL,
    message_sender VARCHAR(30) NOT NULL,
    message_content TEXT NULL,
    sent_time DATETIME NULL,
    is_active TINYINT DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_chat_mensaje_externo (id_mensaje_externo),
    KEY idx_chat_mensaje_sesion (id_session_externo),
    KEY idx_chat_mensaje_fecha (sent_time)
);

CREATE TABLE IF NOT EXISTS chat_compensacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_compensacion_externo BIGINT NULL,
    id_usuario_externo BIGINT NULL,
    id_session_externo BIGINT NULL,
    amount DECIMAL(10, 2) NULL,
    cupon_code VARCHAR(100) NULL,
    expiration_date DATETIME NULL,
    reason TEXT NULL,
    compensation_type ENUM('cupon', 'reembolso') NULL,
    compensation_status ENUM('pendiente', 'procesado', 'usado', 'expirado', 'rechazado') DEFAULT 'pendiente',
    is_active TINYINT DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_chat_compensacion_externa (id_compensacion_externo),
    KEY idx_chat_compensacion_usuario (id_usuario_externo),
    KEY idx_chat_compensacion_sesion (id_session_externo),
    KEY idx_chat_compensacion_estado (compensation_type, compensation_status)
);

CREATE TABLE IF NOT EXISTS chat_support_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_support_request_externo BIGINT NULL,
    id_delivery_externo BIGINT NULL,
    id_pedido_externo BIGINT NULL,
    id_session_externo BIGINT NULL,
    id_problem_externo BIGINT NULL,
    request_status ENUM('pendiente', 'en_proceso', 'resuelto', 'cancelado') DEFAULT 'pendiente',
    problem_details TEXT NULL,
    is_active TINYINT DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_chat_support_externo (id_support_request_externo),
    KEY idx_chat_support_sesion (id_session_externo),
    KEY idx_chat_support_pedido (id_pedido_externo),
    KEY idx_chat_support_estado (request_status)
);

CREATE TABLE IF NOT EXISTS chat_order_inquiry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_inquiry_externo BIGINT NULL,
    id_session_externo BIGINT NOT NULL,
    inquiry_type ENUM('pedido', 'cliente', 'repartidor') NOT NULL,
    input_value VARCHAR(100) NOT NULL,
    inquiry_time DATETIME NULL,
    result_found TINYINT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_chat_inquiry_externo (id_inquiry_externo),
    KEY idx_chat_inquiry_sesion (id_session_externo),
    KEY idx_chat_inquiry_tipo (inquiry_type),
    KEY idx_chat_inquiry_fecha (inquiry_time)
);

CREATE TABLE IF NOT EXISTS chat_payload_auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('sesion', 'mensaje', 'compensacion', 'soporte', 'consulta') NOT NULL,
    external_id BIGINT NULL,
    id_session_externo BIGINT NULL,
    id_usuario_externo BIGINT NULL,
    raw_payload JSON NOT NULL,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_chat_payload_externo (entity_type, external_id),
    KEY idx_chat_payload_sesion (id_session_externo),
    KEY idx_chat_payload_usuario (id_usuario_externo),
    KEY idx_chat_payload_tipo (entity_type)
);

CREATE OR REPLACE VIEW vw_chat_reporte_cliente AS
SELECT
    s.id_usuario_externo,
    s.user_type,
    s.id_session_externo,
    s.current_state,
    s.session_status,
    s.resolution,
    s.start_time,
    s.end_time,
    TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS minutos_resolucion,
    (SELECT COUNT(*) FROM chat_mensaje_historial m WHERE m.id_session_externo = s.id_session_externo) AS total_mensajes,
    (SELECT COUNT(*) FROM chat_compensacion c WHERE c.id_session_externo = s.id_session_externo) AS total_compensaciones,
    (SELECT IFNULL(SUM(c.amount), 0) FROM chat_compensacion c WHERE c.id_session_externo = s.id_session_externo) AS monto_compensaciones,
    (SELECT COUNT(*) FROM chat_support_request sr WHERE sr.id_session_externo = s.id_session_externo) AS total_soporte,
    (SELECT COUNT(*) FROM chat_order_inquiry oi WHERE oi.id_session_externo = s.id_session_externo) AS total_consultas
FROM chat_sesion_resumen s;
