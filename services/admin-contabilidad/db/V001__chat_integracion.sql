-- ============================================================
--  MIGRACIÓN V001 — Integración Admin-Contabilidad ↔ Chats
--  Base de datos : db_admin_contabilidad  (PostgreSQL / Railway)
--  Fecha         : 2026-05-19
-- ============================================================

-- ------------------------------------------------------------
-- 1. chat_resolucion_financiera
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_resolucion_financiera (
    id                 BIGSERIAL       PRIMARY KEY,
    conversation_id    CHAR(36)        NOT NULL,
    tipo_resolucion    VARCHAR(30)     NOT NULL
                           CHECK (tipo_resolucion IN (
                               'RESOLVED_REFUND','RESOLVED_COUPON',
                               'RESOLVED_NO_SOLUTION','CLOSED_MANUAL'
                           )),
    requester_type     VARCHAR(20)     NOT NULL
                           CHECK (requester_type IN ('CUSTOMER','COURIER','BUSINESS')),
    requester_ext_id   VARCHAR(64)     NOT NULL,
    case_type          VARCHAR(20)     NOT NULL DEFAULT 'OTHER'
                           CHECK (case_type IN ('ORDER','DELIVERY','BUSINESS_CASE','OTHER')),
    case_reference     VARCHAR(64),
    movimiento_id      BIGINT,
    reembolso_id       BIGINT,
    compensacion_id    BIGINT,
    estado             VARCHAR(15)     NOT NULL DEFAULT 'pendiente'
                           CHECK (estado IN ('pendiente','procesado','rechazado')),
    notas              TEXT,
    creado_en          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_conversation_id  UNIQUE (conversation_id),
    CONSTRAINT fk_crf_movimiento   FOREIGN KEY (movimiento_id)   REFERENCES movimiento_financiero(id) ON DELETE SET NULL,
    CONSTRAINT fk_crf_reembolso    FOREIGN KEY (reembolso_id)    REFERENCES reembolso_cliente(id)     ON DELETE SET NULL,
    CONSTRAINT fk_crf_compensacion FOREIGN KEY (compensacion_id) REFERENCES compensacion_entidad(id)  ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_crf_estado          ON chat_resolucion_financiera(estado);
CREATE INDEX IF NOT EXISTS idx_crf_tipo_resolucion ON chat_resolucion_financiera(tipo_resolucion);
CREATE INDEX IF NOT EXISTS idx_crf_case_reference  ON chat_resolucion_financiera(case_reference);


-- ------------------------------------------------------------
-- 2. chat_estadistica_periodo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_estadistica_periodo (
    id                       BIGSERIAL       PRIMARY KEY,
    periodo_inicio           DATE            NOT NULL,
    periodo_fin              DATE            NOT NULL,
    total_conversaciones     INT             NOT NULL DEFAULT 0,
    resueltas_reembolso      INT             NOT NULL DEFAULT 0,
    resueltas_cupon          INT             NOT NULL DEFAULT 0,
    resueltas_sin_solucion   INT             NOT NULL DEFAULT 0,
    cerradas_timeout         INT             NOT NULL DEFAULT 0,
    cerradas_manual          INT             NOT NULL DEFAULT 0,
    monto_reembolsado        NUMERIC(18,2)   NOT NULL DEFAULT 0,
    monto_compensado         NUMERIC(18,2)   NOT NULL DEFAULT 0,
    reporte_id               BIGINT,
    generado_en              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cep_reporte FOREIGN KEY (reporte_id) REFERENCES reporte_generado(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cep_periodo ON chat_estadistica_periodo(periodo_inicio, periodo_fin);


-- ------------------------------------------------------------
-- 3. chat_llamada_log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_llamada_log (
    id               BIGSERIAL    PRIMARY KEY,
    metodo           VARCHAR(10)  NOT NULL,
    endpoint         VARCHAR(255) NOT NULL,
    conversation_id  CHAR(36),
    payload          JSONB,
    http_status      SMALLINT,
    respuesta        JSONB,
    duracion_ms      INT,
    error_mensaje    TEXT,
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cll_conversation_id ON chat_llamada_log(conversation_id);
CREATE INDEX IF NOT EXISTS idx_cll_creado_en       ON chat_llamada_log(creado_en);
