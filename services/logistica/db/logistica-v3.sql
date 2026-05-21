-- ============================================================
--  MÓDULO DE LOGÍSTICA — PostgreSQL
--  Versión: 3.0
--  Incluye: feed de repartidores, coords, tarifa, categoría
--           dinámica (tabla), método de pago, cancelación
--           automática, detalles de orden, historial de
--           ubicaciones y WebSocket state
-- ============================================================

-- ------------------------------------------------------------
--  EXTENSIONES
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUIDs opcionales
CREATE EXTENSION IF NOT EXISTS "postgis";    -- Soporte geoespacial (opcional, para consultas de cercanía)

-- ------------------------------------------------------------
--  TIPOS ENUM
-- ------------------------------------------------------------

CREATE TYPE metodo_pago_enum AS ENUM (
    'CASH',
    'CARD'
);

CREATE TYPE tipo_origen_enum AS ENUM (
    'pedido',
    'cotizacion',
    'manual'
);

CREATE TYPE estado_entrega_enum AS ENUM (
    'pendiente',    -- Creada, esperando que un repartidor acepte
    'asignada',     -- Repartidor aceptó (ACCEPTED)
    'en_ruta',      -- Repartidor recogió el paquete (PICKED_UP)
    'entregada',    -- Entrega completada (DELIVERED)
    'fallida',      -- Intento fallido (incidencia no resuelta)
    'cancelada'     -- Cancelada manual o automáticamente
);

CREATE TYPE estado_repartidor_enum AS ENUM (
    'disponible',   -- En línea, sin pedido activo → visible en feed
    'ocupado',      -- Con pedido activo en curso
    'inactivo'      -- Desconectado o fuera de turno
);

CREATE TYPE tipo_incidencia_enum AS ENUM (
    'direccion_incorrecta',
    'cliente_ausente',
    'paquete_danado',
    'rechazo_cliente',
    'accidente',
    'otro'
);

CREATE TYPE motivo_cancelacion_enum AS ENUM (
    'cancelacion_automatica',   -- Job scheduler: nadie aceptó en 5 min
    'cancelado_por_negocio',
    'cancelado_por_admin',
    'error_sistema'
);

CREATE TYPE estado_ws_enum AS ENUM (
    'conectado',
    'desconectado'
);

-- ============================================================
--  TABLA: categorias_orden
--  Tipos de negocio/pedido gestionados por administración.
--  Reemplaza el ENUM fijo para permitir nuevas categorías
--  sin cambios de schema en producción.
-- ============================================================
CREATE TABLE categorias_orden (
    id_categoria        SMALLSERIAL     NOT NULL,
    codigo              VARCHAR(50)     NOT NULL,   -- 'FOOD', 'PET_SHOP', 'LAUNDRY', etc.
    nombre              VARCHAR(100)    NOT NULL,   -- 'Comida', 'Mascotas', 'Lavandería'
    descripcion         TEXT            NULL,       -- Descripción larga para el panel de admin
    icono               VARCHAR(100)    NULL,       -- Nombre del ícono en la UI (ej: 'utensils', 'pill')
    color_hex           VARCHAR(7)      NULL,       -- Color representativo en la UI (ej: '#FF6B35')
    orden_display       SMALLINT        NOT NULL DEFAULT 0,  -- Para ordenar en el feed del repartidor
    activa              BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categorias_orden      PRIMARY KEY (id_categoria),
    CONSTRAINT uq_categorias_codigo     UNIQUE (codigo),
    CONSTRAINT chk_color_hex            CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

COMMENT ON TABLE  categorias_orden              IS 'Tipos de negocio/pedido. Gestionados por admin sin cambios de schema.';
COMMENT ON COLUMN categorias_orden.codigo       IS 'Clave técnica usada en el feed y la API. Ej: FOOD, PHARMACY, PET_SHOP.';
COMMENT ON COLUMN categorias_orden.icono        IS 'Nombre del ícono en el sistema de diseño de la app de repartidores.';
COMMENT ON COLUMN categorias_orden.orden_display IS 'Orden de aparición en filtros y listas del feed. Menor = primero.';
COMMENT ON COLUMN categorias_orden.activa       IS 'FALSE = oculta en el feed y bloqueada para nuevas entregas.';

CREATE INDEX idx_categorias_activa      ON categorias_orden (activa) WHERE activa = TRUE;
CREATE INDEX idx_categorias_orden_disp  ON categorias_orden (orden_display);

-- Datos iniciales — las 4 categorías originales del sistema
INSERT INTO categorias_orden (codigo, nombre, descripcion, icono, color_hex, orden_display) VALUES
    ('FOOD',     'Comida',        'Restaurantes y comida rápida',         'utensils',      '#FF6B35', 1),
    ('MARKET',   'Supermercado',  'Abarrotes y productos del hogar',      'shopping-cart', '#4CAF50', 2),
    ('PHARMACY', 'Farmacia',      'Medicamentos y productos de salud',    'pill',          '#2196F3', 3),
    ('PACKAGE',  'Paquetería',    'Envíos y mandados en general',         'package',       '#9C27B0', 4);

-- ============================================================
--  TABLA: repartidores
--  Perfil operativo del repartidor dentro del módulo de logística.
--  Los datos de usuario (nombre, email, contraseña) viven en el
--  módulo de usuarios — aquí solo guardamos lo logístico.
-- ============================================================
CREATE TABLE repartidores (
    id_repartidor           BIGINT          NOT NULL,   -- FK al módulo de usuarios
    estado                  estado_repartidor_enum NOT NULL DEFAULT 'inactivo',

    -- Última ubicación conocida (actualizada por WebSocket)
    ultima_lat              DECIMAL(10, 7)  NULL,
    ultima_lng              DECIMAL(10, 7)  NULL,
    ultima_ubicacion_at     TIMESTAMPTZ     NULL,

    -- Estado de conexión WebSocket
    ws_estado               estado_ws_enum  NOT NULL DEFAULT 'desconectado',
    ws_conectado_at         TIMESTAMPTZ     NULL,
    ws_desconectado_at      TIMESTAMPTZ     NULL,

    -- Métricas acumuladas (desnormalizadas para rendimiento)
    total_entregas          INTEGER         NOT NULL DEFAULT 0,
    total_cancelaciones     INTEGER         NOT NULL DEFAULT 0,
    calificacion_promedio   DECIMAL(3, 2)   NULL,  -- 0.00 – 5.00

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_repartidores PRIMARY KEY (id_repartidor)
);

COMMENT ON TABLE  repartidores                  IS 'Perfil logístico del repartidor. Datos de usuario en módulo externo.';
COMMENT ON COLUMN repartidores.id_repartidor    IS 'Referencia al id de usuario en el módulo de autenticación/usuarios';
COMMENT ON COLUMN repartidores.estado           IS 'disponible = aparece en feed y recibe pedidos';
COMMENT ON COLUMN repartidores.ws_estado        IS 'Estado actual de la conexión WebSocket de ubicación';

CREATE INDEX idx_repartidores_estado        ON repartidores (estado);
CREATE INDEX idx_repartidores_ws            ON repartidores (ws_estado);
CREATE INDEX idx_repartidores_ubicacion     ON repartidores (ultima_lat, ultima_lng)
    WHERE ultima_lat IS NOT NULL;

-- ============================================================
--  TABLA: entregas
--  Registro principal de cada entrega. Persiste todos los datos
--  del payload de negocios para no depender de ese módulo
--  en tiempo real durante el ciclo de vida de la entrega.
-- ============================================================
CREATE TABLE entregas (
    id_entrega              BIGSERIAL       NOT NULL,

    -- ── Origen del pedido ────────────────────────────────────
    tipo_origen             tipo_origen_enum NOT NULL,
    origen_id               BIGINT          NOT NULL,  -- ID del pedido/cotización en módulo de negocios

    -- ── Referencias a otras entidades del sistema ────────────
    empresa_id              BIGINT          NOT NULL,
    sucursal_id             BIGINT          NULL,
    cliente_id              BIGINT          NOT NULL,

    -- ── Clasificación del pedido (del feed) ──────────────────
    categoria_id            SMALLINT             NOT NULL,   -- FK → categorias_orden
    metodo_pago             metodo_pago_enum     NOT NULL,

    -- ── Datos económicos ─────────────────────────────────────
    tarifa_ofrecida         DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,  -- Lo que gana el repartidor
    monto_cobrar            DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,  -- Total del pedido al cliente
    distancia_estimada_km   DECIMAL(6, 2)   NULL,

    -- ── Estado y ciclo de vida ───────────────────────────────
    estado_entrega          estado_entrega_enum NOT NULL DEFAULT 'pendiente',
    activa                  BOOLEAN         NOT NULL DEFAULT TRUE,

    -- ── Datos del negocio/remitente (persistidos de negocios) ─
    negocio_nombre          VARCHAR(255)    NOT NULL,
    negocio_telefono        VARCHAR(20)     NULL,
    negocio_direccion       TEXT            NOT NULL,
    origen_lat              DECIMAL(10, 7)  NOT NULL,
    origen_lng              DECIMAL(10, 7)  NOT NULL,

    -- ── Datos del cliente/destinatario ───────────────────────
    cliente_nombre          VARCHAR(255)    NOT NULL,
    cliente_telefono        VARCHAR(20)     NULL,
    direccion_entrega       TEXT            NOT NULL,
    referencia_direccion    VARCHAR(255)    NULL,
    instrucciones_entrega   TEXT            NULL,
    destino_lat             DECIMAL(10, 7)  NOT NULL,
    destino_lng             DECIMAL(10, 7)  NOT NULL,

    -- ── Detalle de productos / descripción del paquete ───────
    -- Array de strings: ["1x Analgésico 500mg", "2x Suero Rehidratante"]
    detalles_orden          JSONB           NULL,

    -- ── Cancelación automática (regla de 5 minutos) ──────────
    -- Job scheduler cancela si nadie acepta antes de este timestamp
    cancelacion_auto_at     TIMESTAMPTZ     NULL,
    motivo_cancelacion      motivo_cancelacion_enum NULL,

    -- ── Fechas ───────────────────────────────────────────────
    fecha_entrega_estimada  TIMESTAMPTZ     NULL,
    fecha_entrega_real      TIMESTAMPTZ     NULL,

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_entregas PRIMARY KEY (id_entrega),

    CONSTRAINT fk_entregas_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias_orden (id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Un pedido/cotización solo puede tener una entrega activa a la vez
    CONSTRAINT uq_entregas_origen_activa
        UNIQUE (tipo_origen, origen_id, activa)
        DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE  entregas                      IS 'Registro principal de entregas. Persiste datos de negocios para independencia operativa.';
COMMENT ON COLUMN entregas.origen_id            IS 'ID del pedido o cotización en el módulo de negocios/restaurantes';
COMMENT ON COLUMN entregas.categoria_id         IS 'FK a categorias_orden. Determina ícono y etiqueta en el feed del repartidor.';
COMMENT ON COLUMN entregas.tarifa_ofrecida      IS 'Ganancia del repartidor. Visible en FeedOrderCard.';
COMMENT ON COLUMN entregas.monto_cobrar         IS 'Total que el cliente debe pagar (usado en cobros contra entrega).';
COMMENT ON COLUMN entregas.detalles_orden       IS 'Lista de productos o descripción del paquete. Ej: ["1x Agua", "2x Pan"]';
COMMENT ON COLUMN entregas.cancelacion_auto_at  IS 'Si nadie acepta antes de este ts, el job scheduler cancela automáticamente.';
COMMENT ON COLUMN entregas.activa               IS 'FALSE cuando la entrega fue cancelada o completada.';

-- Índices de consulta frecuente
CREATE INDEX idx_entregas_empresa           ON entregas (empresa_id);
CREATE INDEX idx_entregas_sucursal          ON entregas (sucursal_id) WHERE sucursal_id IS NOT NULL;
CREATE INDEX idx_entregas_cliente           ON entregas (cliente_id);
CREATE INDEX idx_entregas_estado            ON entregas (estado_entrega);
CREATE INDEX idx_entregas_activa            ON entregas (activa);
CREATE INDEX idx_entregas_origen            ON entregas (tipo_origen, origen_id);
CREATE INDEX idx_entregas_categoria         ON entregas (categoria_id);
CREATE INDEX idx_entregas_cancelacion_auto  ON entregas (cancelacion_auto_at)
    WHERE cancelacion_auto_at IS NOT NULL AND estado_entrega = 'pendiente';
CREATE INDEX idx_entregas_coords_origen     ON entregas (origen_lat, origen_lng);
CREATE INDEX idx_entregas_detalles          ON entregas USING GIN (detalles_orden);

-- ============================================================
--  TABLA: asignaciones_entrega
--  Gestiona qué repartidor atiende cada entrega.
--  Permite historial completo de reasignaciones.
-- ============================================================
CREATE TABLE asignaciones_entrega (
    id_asignacion               BIGSERIAL   NOT NULL,
    entrega_id                  BIGINT      NOT NULL,
    repartidor_id               BIGINT      NOT NULL,
    asignado_por_usuario_id     BIGINT      NOT NULL,  -- Admin o sistema (job scheduler)

    fecha_asignacion            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_liberacion            TIMESTAMPTZ NULL,      -- Cuándo dejó de ser la asignación activa

    -- Solo una asignación activa por entrega a la vez
    activa                      BOOLEAN     NOT NULL DEFAULT TRUE,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_asignaciones PRIMARY KEY (id_asignacion),
    CONSTRAINT fk_asig_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_asig_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES repartidores (id_repartidor)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Garantiza que solo haya una asignación activa por entrega
    CONSTRAINT uq_asig_entrega_activa
        EXCLUDE USING btree (entrega_id WITH =)
        WHERE (activa = TRUE)
);

COMMENT ON TABLE  asignaciones_entrega                      IS 'Historial de asignaciones de repartidor por entrega. Soporta reasignaciones.';
COMMENT ON COLUMN asignaciones_entrega.activa               IS 'Solo una fila con activa=TRUE por entrega_id en cualquier momento.';
COMMENT ON COLUMN asignaciones_entrega.asignado_por_usuario_id IS 'ID 0 o especial si fue el job scheduler (cancelación automática / reasignación).';

CREATE INDEX idx_asig_entrega       ON asignaciones_entrega (entrega_id);
CREATE INDEX idx_asig_repartidor    ON asignaciones_entrega (repartidor_id);
CREATE INDEX idx_asig_activa        ON asignaciones_entrega (activa) WHERE activa = TRUE;
CREATE INDEX idx_asig_fecha         ON asignaciones_entrega (fecha_asignacion);

-- ============================================================
--  TABLA: historial_estados_entrega
--  Auditoría completa de cada cambio de estado.
--  Inmutable: nunca se actualiza, solo se inserta.
-- ============================================================
CREATE TABLE historial_estados_entrega (
    id_historial_estado         BIGSERIAL           NOT NULL,
    entrega_id                  BIGINT              NOT NULL,

    estado_anterior             estado_entrega_enum NULL,   -- NULL en la creación inicial
    estado_nuevo                estado_entrega_enum NOT NULL,

    cambiado_por_usuario_id     BIGINT              NOT NULL,
    repartidor_id               BIGINT              NULL,   -- Contexto: quién era el repartidor en ese momento
    comentario                  TEXT                NULL,

    -- Metadata de la transición
    origen_cambio               VARCHAR(50)         NOT NULL DEFAULT 'manual',
    -- 'manual'=admin, 'repartidor'=acción en app, 'sistema'=job scheduler, 'negocio'=push de negocios

    created_at                  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_historial_estados PRIMARY KEY (id_historial_estado),
    CONSTRAINT fk_hist_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_hist_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES repartidores (id_repartidor)
        ON DELETE SET NULL ON UPDATE CASCADE
);

COMMENT ON TABLE  historial_estados_entrega             IS 'Auditoría inmutable de cambios de estado. Nunca se actualiza, solo INSERT.';
COMMENT ON COLUMN historial_estados_entrega.origen_cambio IS 'Quién o qué originó el cambio: manual | repartidor | sistema | negocio';

CREATE INDEX idx_hist_entrega       ON historial_estados_entrega (entrega_id);
CREATE INDEX idx_hist_repartidor    ON historial_estados_entrega (repartidor_id) WHERE repartidor_id IS NOT NULL;
CREATE INDEX idx_hist_estado_nuevo  ON historial_estados_entrega (estado_nuevo);
CREATE INDEX idx_hist_fecha         ON historial_estados_entrega (created_at);
CREATE INDEX idx_hist_origen        ON historial_estados_entrega (origen_cambio);

-- ============================================================
--  TABLA: incidencias_entrega
--  Problemas registrados durante la entrega por el repartidor.
-- ============================================================
CREATE TABLE incidencias_entrega (
    id_incidencia               BIGSERIAL               NOT NULL,
    entrega_id                  BIGINT                  NOT NULL,
    repartidor_id               BIGINT                  NULL,   -- Quién reportó

    tipo_incidencia             tipo_incidencia_enum    NOT NULL,
    descripcion                 TEXT                    NOT NULL,

    resuelta                    BOOLEAN                 NOT NULL DEFAULT FALSE,
    resuelta_por_usuario_id     BIGINT                  NULL,
    comentario_resolucion       TEXT                    NULL,
    resuelta_at                 TIMESTAMPTZ             NULL,

    created_at                  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_incidencias PRIMARY KEY (id_incidencia),
    CONSTRAINT fk_inc_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inc_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES repartidores (id_repartidor)
        ON DELETE SET NULL ON UPDATE CASCADE
);

COMMENT ON TABLE incidencias_entrega IS 'Incidencias reportadas por el repartidor durante la entrega.';

CREATE INDEX idx_inc_entrega        ON incidencias_entrega (entrega_id);
CREATE INDEX idx_inc_repartidor     ON incidencias_entrega (repartidor_id) WHERE repartidor_id IS NOT NULL;
CREATE INDEX idx_inc_tipo           ON incidencias_entrega (tipo_incidencia);
CREATE INDEX idx_inc_resuelta       ON incidencias_entrega (resuelta) WHERE resuelta = FALSE;

-- ============================================================
--  TABLA: historial_ubicaciones_repartidor
--  Registro de las posiciones emitidas por WebSocket.
--  Usado para: rastreo en tiempo real, análisis de rutas,
--  auditoría de recorridos y cálculo de distancias reales.
-- ============================================================
CREATE TABLE historial_ubicaciones_repartidor (
    id_ubicacion        BIGSERIAL       NOT NULL,
    repartidor_id       BIGINT          NOT NULL,
    entrega_id          BIGINT          NULL,   -- NULL cuando está disponible sin pedido activo

    lat                 DECIMAL(10, 7)  NOT NULL,
    lng                 DECIMAL(10, 7)  NOT NULL,
    heading             DECIMAL(5, 2)   NULL,   -- Dirección en grados (0–360), para animar el pin

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_historial_ubicaciones PRIMARY KEY (id_ubicacion),
    CONSTRAINT fk_ubic_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES repartidores (id_repartidor)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ubic_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE SET NULL ON UPDATE CASCADE
);

COMMENT ON TABLE  historial_ubicaciones_repartidor          IS 'Posiciones emitidas por WS. Permite rastreo y auditoría de recorridos.';
COMMENT ON COLUMN historial_ubicaciones_repartidor.heading  IS 'Grados de dirección (0-360) para animar el pin en el mapa del cliente.';
COMMENT ON COLUMN historial_ubicaciones_repartidor.entrega_id IS 'Asociado a entrega cuando el repartidor está en ruta. NULL si está disponible.';

-- Índice principal por repartidor + tiempo (consultas de rastreo)
CREATE INDEX idx_ubic_repartidor_time   ON historial_ubicaciones_repartidor (repartidor_id, created_at DESC);
CREATE INDEX idx_ubic_entrega           ON historial_ubicaciones_repartidor (entrega_id) WHERE entrega_id IS NOT NULL;
-- Índice geoespacial para consultas de cercanía (requiere PostGIS)
-- CREATE INDEX idx_ubic_geom ON historial_ubicaciones_repartidor
--     USING GIST (ST_MakePoint(lng, lat));

-- ============================================================
--  TABLA: notificaciones_logistica
--  Registro de las notificaciones enviadas al módulo de negocios.
--  Permite reintentos y auditoría de la integración.
-- ============================================================
CREATE TABLE notificaciones_logistica (
    id_notificacion     BIGSERIAL       NOT NULL,
    entrega_id          BIGINT          NOT NULL,

    -- Qué se notificó
    evento              VARCHAR(50)     NOT NULL,
    -- 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'FAILED'

    -- A quién se notificó
    destino_url         TEXT            NOT NULL,   -- Endpoint del módulo de negocios
    payload             JSONB           NOT NULL,   -- Cuerpo enviado

    -- Resultado
    exitosa             BOOLEAN         NOT NULL DEFAULT FALSE,
    http_status         SMALLINT        NULL,
    respuesta           TEXT            NULL,
    intentos            SMALLINT        NOT NULL DEFAULT 0,
    ultimo_intento_at   TIMESTAMPTZ     NULL,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notificaciones PRIMARY KEY (id_notificacion),
    CONSTRAINT fk_notif_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE  notificaciones_logistica          IS 'Log de notificaciones enviadas al módulo de negocios. Permite reintentos.';
COMMENT ON COLUMN notificaciones_logistica.intentos IS 'Número de intentos realizados. Útil para circuit breaker y alertas.';

CREATE INDEX idx_notif_entrega      ON notificaciones_logistica (entrega_id);
CREATE INDEX idx_notif_exitosa      ON notificaciones_logistica (exitosa) WHERE exitosa = FALSE;
CREATE INDEX idx_notif_evento       ON notificaciones_logistica (evento);
CREATE INDEX idx_notif_fecha        ON notificaciones_logistica (created_at);

-- ============================================================
--  TABLA: calificaciones_entrega
--  Calificación del repartidor al completar la entrega.
--  Disparada cuando estado_entrega → 'entregada'.
-- ============================================================
CREATE TABLE calificaciones_entrega (
    id_calificacion     BIGSERIAL       NOT NULL,
    entrega_id          BIGINT          NOT NULL,
    repartidor_id       BIGINT          NOT NULL,

    -- Calificación del cliente al repartidor (1–5)
    puntuacion          SMALLINT        NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario          TEXT            NULL,

    -- Quién calificó (normalmente el módulo de negocios lo registra
    -- tras recibir la respuesta del cliente)
    calificado_por      VARCHAR(20)     NOT NULL DEFAULT 'cliente',
    -- 'cliente' | 'negocio' | 'admin'

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_calificaciones PRIMARY KEY (id_calificacion),
    CONSTRAINT uq_calificacion_entrega  UNIQUE (entrega_id),  -- Una calificación por entrega
    CONSTRAINT fk_calif_entrega
        FOREIGN KEY (entrega_id)
        REFERENCES entregas (id_entrega)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_calif_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES repartidores (id_repartidor)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE calificaciones_entrega IS 'Calificación del repartidor al completar la entrega. Una por entrega.';

CREATE INDEX idx_calif_repartidor   ON calificaciones_entrega (repartidor_id);
CREATE INDEX idx_calif_puntuacion   ON calificaciones_entrega (puntuacion);

-- ============================================================
--  FUNCIÓN + TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entregas_updated_at
    BEFORE UPDATE ON entregas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_categorias_updated_at
    BEFORE UPDATE ON categorias_orden
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_repartidores_updated_at
    BEFORE UPDATE ON repartidores
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_incidencias_updated_at
    BEFORE UPDATE ON incidencias_entrega
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
--  FUNCIÓN + TRIGGER: actualizar calificacion_promedio
--  en repartidores al insertar/actualizar una calificación
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_calificacion_promedio()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE repartidores
    SET calificacion_promedio = (
        SELECT ROUND(AVG(puntuacion)::NUMERIC, 2)
        FROM calificaciones_entrega
        WHERE repartidor_id = NEW.repartidor_id
    )
    WHERE id_repartidor = NEW.repartidor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calificacion_promedio
    AFTER INSERT OR UPDATE ON calificaciones_entrega
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_calificacion_promedio();

-- ============================================================
--  FUNCIÓN + TRIGGER: incrementar total_entregas
--  en repartidores al marcar una entrega como entregada
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_metricas_repartidor()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar total_entregas al completar
    IF NEW.estado_entrega = 'entregada' AND OLD.estado_entrega != 'entregada' THEN
        UPDATE repartidores
        SET total_entregas = total_entregas + 1
        WHERE id_repartidor = (
            SELECT repartidor_id FROM asignaciones_entrega
            WHERE entrega_id = NEW.id_entrega AND activa = TRUE
            LIMIT 1
        );
    END IF;

    -- Incrementar total_cancelaciones si fue cancelada mientras estaba asignada
    IF NEW.estado_entrega = 'cancelada' AND OLD.estado_entrega = 'asignada' THEN
        UPDATE repartidores
        SET total_cancelaciones = total_cancelaciones + 1
        WHERE id_repartidor = (
            SELECT repartidor_id FROM asignaciones_entrega
            WHERE entrega_id = NEW.id_entrega AND activa = TRUE
            LIMIT 1
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_metricas_repartidor
    AFTER UPDATE OF estado_entrega ON entregas
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_metricas_repartidor();

-- ============================================================
--  VISTAS ÚTILES
-- ============================================================

-- Vista: entregas pendientes con tiempo restante para cancelación
CREATE VIEW v_entregas_pendientes_feed AS
SELECT
    e.id_entrega,
    e.tipo_origen,
    e.origen_id,
    e.empresa_id,
    e.sucursal_id,
    e.categoria_id,
    c.codigo            AS categoria_codigo,
    c.nombre            AS categoria_nombre,
    c.icono             AS categoria_icono,
    c.color_hex         AS categoria_color,
    e.metodo_pago,
    e.tarifa_ofrecida,
    e.monto_cobrar,
    e.distancia_estimada_km,
    e.negocio_nombre,
    e.negocio_direccion,
    e.origen_lat,
    e.origen_lng,
    e.destino_lat,
    e.destino_lng,
    e.cancelacion_auto_at,
    EXTRACT(EPOCH FROM (e.cancelacion_auto_at - NOW())) AS segundos_para_cancelar,
    e.created_at
FROM entregas e
JOIN categorias_orden c ON c.id_categoria = e.categoria_id
WHERE e.estado_entrega = 'pendiente'
  AND e.activa = TRUE
ORDER BY e.created_at ASC;

COMMENT ON VIEW v_entregas_pendientes_feed IS 'Feed de pedidos pendientes de asignación con tiempo restante antes de cancelación automática.';

-- Vista: entregas activas con repartidor asignado
CREATE VIEW v_entregas_activas AS
SELECT
    e.id_entrega,
    e.origen_id,
    e.categoria_id,
    c.codigo            AS categoria_codigo,
    c.nombre            AS categoria_nombre,
    c.icono             AS categoria_icono,
    c.color_hex         AS categoria_color,
    e.metodo_pago,
    e.estado_entrega,
    e.tarifa_ofrecida,
    e.monto_cobrar,
    e.distancia_estimada_km,
    e.negocio_nombre,
    e.negocio_telefono,
    e.negocio_direccion,
    e.origen_lat,
    e.origen_lng,
    e.cliente_nombre,
    e.cliente_telefono,
    e.direccion_entrega,
    e.referencia_direccion,
    e.instrucciones_entrega,
    e.destino_lat,
    e.destino_lng,
    e.detalles_orden,
    e.fecha_entrega_estimada,
    a.repartidor_id,
    a.fecha_asignacion,
    r.ultima_lat          AS repartidor_lat,
    r.ultima_lng          AS repartidor_lng,
    r.ultima_ubicacion_at
FROM entregas e
JOIN categorias_orden c             ON c.id_categoria = e.categoria_id
JOIN asignaciones_entrega a         ON a.entrega_id = e.id_entrega AND a.activa = TRUE
JOIN repartidores r                 ON r.id_repartidor = a.repartidor_id
WHERE e.estado_entrega IN ('asignada', 'en_ruta')
  AND e.activa = TRUE;

COMMENT ON VIEW v_entregas_activas IS 'Entregas en curso con datos del repartidor asignado y su última ubicación.';

-- Vista: repartidores disponibles con última posición (para el feed)
CREATE VIEW v_repartidores_disponibles AS
SELECT
    r.id_repartidor,
    r.estado,
    r.ultima_lat,
    r.ultima_lng,
    r.ultima_ubicacion_at,
    r.calificacion_promedio,
    r.total_entregas,
    r.ws_estado,
    EXTRACT(EPOCH FROM (NOW() - r.ultima_ubicacion_at)) AS segundos_desde_ultima_ubicacion
FROM repartidores r
WHERE r.estado = 'disponible'
  AND r.ws_estado = 'conectado'
ORDER BY r.ultima_ubicacion_at DESC;

COMMENT ON VIEW v_repartidores_disponibles IS 'Repartidores en línea y disponibles para recibir pedidos.';

-- ============================================================
--  DATOS DE EJEMPLO
-- ============================================================
/*
-- Repartidor de ejemplo
INSERT INTO repartidores (id_repartidor, estado, ultima_lat, ultima_lng, ws_estado)
VALUES (10, 'disponible', 14.8340, -91.5260, 'conectado');

-- Entrega de ejemplo (categoria_id=3 = PHARMACY según los datos iniciales)
INSERT INTO entregas (
    tipo_origen, origen_id, empresa_id, sucursal_id, cliente_id,
    categoria_id, metodo_pago, tarifa_ofrecida, monto_cobrar, distancia_estimada_km,
    negocio_nombre, negocio_telefono, negocio_direccion, origen_lat, origen_lng,
    cliente_nombre, cliente_telefono, direccion_entrega, referencia_direccion,
    destino_lat, destino_lng,
    detalles_orden, cancelacion_auto_at
) VALUES (
    'pedido', 8899, 1, 1, 500,
    3, 'CASH', 25.00, 150.00, 4.2,
    'Farmacia Galeno', '7776-5544', 'Zona 3, Quetzaltenango', 14.8355, -91.5275,
    'María López', '4433-2211', 'Zona 1, Quetzaltenango', 'Portón azul frente al parque',
    14.8400, -91.5200,
    '["1x Analgésico 500mg", "2x Suero Rehidratante"]'::JSONB,
    NOW() + INTERVAL '5 minutes'
);

-- Estado inicial en historial
INSERT INTO historial_estados_entrega
    (entrega_id, estado_anterior, estado_nuevo, cambiado_por_usuario_id, origen_cambio, comentario)
VALUES (1, NULL, 'pendiente', 1, 'sistema', 'Entrega creada automáticamente desde pedido ORD-8899');
*/