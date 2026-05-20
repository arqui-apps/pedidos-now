CREATE TABLE IF NOT EXISTS cobro (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    pedido_id INTEGER NOT NULL,
    monto_total DECIMAL(15, 2) NOT NULL,
    tarifa_servicio DECIMAL(15, 2) DEFAULT 0,
    propina DECIMAL(15, 2) DEFAULT 0,
    tipo_pago VARCHAR(50) NOT NULL CHECK (tipo_pago IN ('efectivo', 'tarjeta', 'cupon')),
    repartidor_id INTEGER,
    cupon_id INTEGER,
    estado VARCHAR(50) DEFAULT 'completado' CHECK (estado IN ('completado', 'denegado', 'cancelado', 'pendiente')),
    fecha_cobro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cobro_cliente ON cobro(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cobro_pedido ON cobro(pedido_id);
CREATE INDEX IF NOT EXISTS idx_cobro_repartidor ON cobro(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_cobro_estado ON cobro(estado);
CREATE INDEX IF NOT EXISTS idx_cobro_fecha ON cobro(fecha_cobro);