-- =========================================================
-- Integracion Chat Automatizado -> Administracion Contable
-- =========================================================
-- Este script esta pensado para copiar y pegar en MySQL Workbench.
-- Crea la base si no existe, selecciona la base, crea las tablas
-- necesarias y recrea la vista de reporte por cliente.
--
-- Es idempotente: se puede ejecutar mas de una vez.
-- No usa llaves foraneas porque estos datos vienen de otro
-- microservicio y Administracion solo debe copiarlos/guardarlos,
-- aunque lleguen en distinto orden.
-- =========================================================

CREATE DATABASE IF NOT EXISTS admin_conta
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE admin_conta;

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
    KEY idx_chat_sesion_estado (session_status, resolution),
    KEY idx_chat_sesion_fecha (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP VIEW IF EXISTS vw_chat_reporte_cliente;

CREATE VIEW vw_chat_reporte_cliente AS
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
    TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS minutos_resolucion,
    IFNULL(m.total_mensajes, 0) AS total_mensajes,
    IFNULL(c.total_compensaciones, 0) AS total_compensaciones,
    IFNULL(c.monto_compensaciones, 0) AS monto_compensaciones,
    IFNULL(sr.total_soporte, 0) AS total_soporte,
    IFNULL(oi.total_consultas, 0) AS total_consultas,
    IFNULL(pa.total_payloads_recibidos, 0) AS total_payloads_recibidos
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
        SUM(IFNULL(amount, 0)) AS monto_compensaciones
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
) pa ON pa.id_session_externo = s.id_session_externo;