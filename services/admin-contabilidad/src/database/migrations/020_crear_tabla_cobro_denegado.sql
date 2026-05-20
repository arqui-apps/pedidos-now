CREATE TABLE IF NOT EXISTS cobro_denegado (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    pedido_id INTEGER NOT NULL,
    monto_intentado DECIMAL(15, 2) NOT NULL,
    razon VARCHAR(255) NOT NULL,
    tipo_pago VARCHAR(50) NOT NULL,
    repartidor_id INTEGER,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cobro_denegado_cliente ON cobro_denegado(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cobro_denegado_pedido ON cobro_denegado(pedido_id);
CREATE INDEX IF NOT EXISTS idx_cobro_denegado_fecha ON cobro_denegado(fecha_intento);