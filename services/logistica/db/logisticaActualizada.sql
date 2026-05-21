-- ============================================================
--  Módulo de Logística — MySQL
--  Generado para el módulo de entregas / paquetería
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS incidencias_entrega;
DROP TABLE IF EXISTS historial_estados_entrega;
DROP TABLE IF EXISTS asignaciones_entrega;
DROP TABLE IF EXISTS entregas;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
--  ENUMs (simulados con columnas ENUM nativas de MySQL)
-- ------------------------------------------------------------

-- Valores válidos para tipo_origen:
--   'pedido', 'cotizacion', 'manual'
--
-- Valores válidos para estado_entrega:
--   'pendiente', 'asignada', 'en_ruta', 'entregada', 'fallida', 'cancelada'
--
-- Valores válidos para tipo_incidencia:
--   'direccion_incorrecta', 'cliente_ausente', 'paquete_danado',
--   'rechazo_cliente', 'accidente', 'otro'


-- ------------------------------------------------------------
--  Tabla: entregas
-- ------------------------------------------------------------
CREATE TABLE entregas (
    id_entrega              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,

    -- Origen del pedido
    tipo_origen             ENUM(
                                'pedido',
                                'cotizacion',
                                'manual'
                            )                   NOT NULL,
    origen_id               BIGINT UNSIGNED     NOT NULL,

    -- Relaciones con otras entidades del sistema
    empresa_id              BIGINT UNSIGNED     NOT NULL,
    sucursal_id             BIGINT UNSIGNED     NULL,
    cliente_id              BIGINT UNSIGNED     NOT NULL,

    -- Estado y ciclo de vida
    estado_entrega          ENUM(
                                'pendiente',
                                'asignada',
                                'en_ruta',
                                'entregada',
                                'fallida',
                                'cancelada'
                            )                   NOT NULL DEFAULT 'pendiente',
    activa                  BOOLEAN             NOT NULL DEFAULT TRUE,

    -- Dirección de destino
    direccion_entrega       TEXT                NOT NULL,
    referencia_direccion    VARCHAR(255)        NULL,
    instrucciones_entrega   TEXT                NULL,

    -- Datos económicos
    monto_cobrar            DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,

    -- Fechas
    fecha_entrega_estimada  DATETIME            NULL,
    fecha_entrega_real      DATETIME            NULL,
    created_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id_entrega),

    -- Índices para consultas frecuentes
    INDEX idx_entregas_empresa      (empresa_id),
    INDEX idx_entregas_sucursal     (sucursal_id),
    INDEX idx_entregas_cliente      (cliente_id),
    INDEX idx_entregas_estado       (estado_entrega),
    INDEX idx_entregas_activa       (activa),
    INDEX idx_entregas_origen       (tipo_origen, origen_id),
    INDEX idx_entregas_fecha_est    (fecha_entrega_estimada)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro principal de entregas del módulo de logística';


-- ------------------------------------------------------------
--  Tabla: asignaciones_entrega
--  Gestiona qué repartidor atiende cada entrega (con historial)
-- ------------------------------------------------------------
CREATE TABLE asignaciones_entrega (
    id_asignacion               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    entrega_id                  BIGINT UNSIGNED NOT NULL,
    repartidor_id               BIGINT UNSIGNED NOT NULL,
    asignado_por_usuario_id     BIGINT UNSIGNED NOT NULL,

    fecha_asignacion            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Solo una asignación puede estar activa por entrega a la vez
    activa                      BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_asignacion),

    CONSTRAINT fk_asig_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_asig_entrega      (entrega_id),
    INDEX idx_asig_repartidor   (repartidor_id),
    INDEX idx_asig_activa       (activa),
    INDEX idx_asig_fecha        (fecha_asignacion)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Asignaciones de repartidor a entrega — permite reasignaciones con historial';


-- ------------------------------------------------------------
--  Tabla: historial_estados_entrega
--  Auditoría de cada cambio de estado en una entrega
-- ------------------------------------------------------------
CREATE TABLE historial_estados_entrega (
    id_historial_estado         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    entrega_id                  BIGINT UNSIGNED NOT NULL,

    estado_anterior             ENUM(
                                    'pendiente',
                                    'asignada',
                                    'en_ruta',
                                    'entregada',
                                    'fallida',
                                    'cancelada'
                                )               NULL       COMMENT 'NULL cuando es el estado inicial',
    estado_nuevo                ENUM(
                                    'pendiente',
                                    'asignada',
                                    'en_ruta',
                                    'entregada',
                                    'fallida',
                                    'cancelada'
                                )               NOT NULL,

    cambiado_por_usuario_id     BIGINT UNSIGNED NOT NULL,
    comentario                  TEXT            NULL,

    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_historial_estado),

    CONSTRAINT fk_historial_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_hist_entrega      (entrega_id),
    INDEX idx_hist_usuario      (cambiado_por_usuario_id),
    INDEX idx_hist_estado_nuevo (estado_nuevo),
    INDEX idx_hist_fecha        (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Auditoría completa de cambios de estado por entrega';


-- ------------------------------------------------------------
--  Tabla: incidencias_entrega
--  Problemas o eventos especiales durante la entrega
-- ------------------------------------------------------------
CREATE TABLE incidencias_entrega (
    id_incidencia               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    entrega_id                  BIGINT UNSIGNED NOT NULL,
    repartidor_id               BIGINT UNSIGNED NULL       COMMENT 'NULL si la incidencia no involucra al repartidor',

    tipo_incidencia             ENUM(
                                    'direccion_incorrecta',
                                    'cliente_ausente',
                                    'paquete_danado',
                                    'rechazo_cliente',
                                    'accidente',
                                    'otro'
                                )               NOT NULL,
    descripcion                 TEXT            NOT NULL,
    resuelta                    BOOLEAN         NOT NULL DEFAULT FALSE,

    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id_incidencia),

    CONSTRAINT fk_incidencia_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_inc_entrega       (entrega_id),
    INDEX idx_inc_repartidor    (repartidor_id),
    INDEX idx_inc_tipo          (tipo_incidencia),
    INDEX idx_inc_resuelta      (resuelta)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Incidencias y problemas registrados durante la entrega';


-- ============================================================
--  Datos iniciales de ejemplo (opcional — comentar si no aplica)
-- ============================================================

/*
INSERT INTO entregas
    (tipo_origen, origen_id, empresa_id, sucursal_id, cliente_id,
     estado_entrega, activa, direccion_entrega, monto_cobrar)
VALUES
    ('pedido', 1001, 1, 1, 500, 'pendiente', TRUE, '6a Av. 10-25, Zona 9, Guatemala', 150.00),
    ('manual', 1002, 1, 2, 501, 'asignada',  TRUE, '12 Calle 5-50, Zona 1, Guatemala', 75.50);

INSERT INTO asignaciones_entrega
    (entrega_id, repartidor_id, asignado_por_usuario_id, activa)
VALUES
    (2, 10, 3, TRUE);

INSERT INTO historial_estados_entrega
    (entrega_id, estado_anterior, estado_nuevo, cambiado_por_usuario_id, comentario)
VALUES
    (1, NULL,        'pendiente', 3, 'Entrega creada'),
    (2, NULL,        'pendiente', 3, 'Entrega creada'),
    (2, 'pendiente', 'asignada',  3, 'Repartidor asignado');
*/