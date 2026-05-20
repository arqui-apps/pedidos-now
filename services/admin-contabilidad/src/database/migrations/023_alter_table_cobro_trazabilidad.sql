ALTER TABLE cobro
ADD COLUMN IF NOT EXISTS numero_transaccion TEXT;

ALTER TABLE cobro
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cobro_idempotency
ON cobro(idempotency_key);