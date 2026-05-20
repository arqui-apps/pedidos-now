CREATE TABLE IF NOT EXISTS cobro_cancelado (
    id SERIAL PRIMARY KEY,
    cobro_id INTEGER NOT NULL,
    razon VARCHAR(255) NOT NULL,
    reembolsado BOOLEAN DEFAULT FALSE,
    monto_reembolso DECIMAL(15, 2) DEFAULT 0,
    fecha_cancelacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cobro_cancelado_cobro FOREIGN KEY (cobro_id) REFERENCES cobro(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cobro_cancelado_cobro ON cobro_cancelado(cobro_id);
CREATE INDEX IF NOT EXISTS idx_cobro_cancelado_fecha ON cobro_cancelado(fecha_cancelacion);