REATE DATABASE IF NOT EXISTS modulo_logistica_db;
USE modulo_logistica_db;

-- =========================
-- ENUMS MEDIANTE CHECK
-- =========================

-- =========================
-- TABLAS DE ADMINISTRACION
-- =========================

CREATE TABLE repartidores (
   id_repartidor BIGINT AUTO_INCREMENT PRIMARY KEY,
   usuario_id BIGINT NOT NULL UNIQUE,
   codigo_repartidor VARCHAR(30) NOT NULL UNIQUE,
   nombres VARCHAR(120) NOT NULL,
   apellidos VARCHAR(120) NOT NULL,
   telefono VARCHAR(20) NOT NULL,
   correo VARCHAR(120) NULL,
   activo BOOLEAN NOT NULL DEFAULT TRUE,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE estados_operativos_repartidor (
   id_estado_operativo BIGINT AUTO_INCREMENT PRIMARY KEY,
   repartidor_id BIGINT NOT NULL UNIQUE,
   estado VARCHAR(20) NOT NULL DEFAULT 'desconectado',
   modulo_actual VARCHAR(20) NOT NULL DEFAULT 'ninguno',
   ultimo_login DATETIME NULL,
   ultima_actividad DATETIME NULL,
   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   CONSTRAINT fk_estado_repartidor
       FOREIGN KEY (repartidor_id) REFERENCES repartidores(id_repartidor),
   CONSTRAINT chk_estado_operativo
       CHECK (estado IN ('disponible', 'ocupado', 'en_ruta', 'desconectado', 'inactivo', 'suspendido')),
   CONSTRAINT chk_modulo_actual
       CHECK (modulo_actual IN ('logistica', 'paqueteria', 'ninguno'))
);

-- =========================
-- TABLAS DE LOGISTICA
-- =========================

CREATE TABLE entregas (
   id_entrega BIGINT AUTO_INCREMENT PRIMARY KEY,
   tipo_origen VARCHAR(20) NOT NULL,
   origen_id BIGINT NOT NULL,
   empresa_id BIGINT NOT NULL,
   sucursal_id BIGINT NULL,
   cliente_id BIGINT NOT NULL,
   repartidor_id BIGINT NULL,
   estado_entrega VARCHAR(25) NOT NULL DEFAULT 'pendiente',
   direccion_entrega TEXT NOT NULL,
   referencia_direccion VARCHAR(255) NULL,
   instrucciones_entrega TEXT NULL,
   monto_cobrar DECIMAL(10,2) NOT NULL DEFAULT 0.00,
   fecha_entrega_estimada DATETIME NULL,
   fecha_entrega_real DATETIME NULL,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   CONSTRAINT fk_entrega_repartidor
       FOREIGN KEY (repartidor_id) REFERENCES repartidores(id_repartidor),
   CONSTRAINT uq_entrega_origen
       UNIQUE (tipo_origen, origen_id),
   CONSTRAINT chk_tipo_origen
       CHECK (tipo_origen IN ('restaurante', 'negocio')),
   CONSTRAINT chk_estado_entrega
       CHECK (estado_entrega IN (
           'pendiente',
           'asignada',
           'en_preparacion',
           'lista_para_recoger',
           'en_camino',
           'entregada',
           'cancelada',
           'fallida'
       ))
);

CREATE TABLE asignaciones_entrega (
   id_asignacion BIGINT AUTO_INCREMENT PRIMARY KEY,
   entrega_id BIGINT NOT NULL,
   repartidor_id BIGINT NOT NULL,
   asignado_por_usuario_id BIGINT NOT NULL,
   fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   activa BOOLEAN NOT NULL DEFAULT TRUE,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT fk_asignacion_entrega
       FOREIGN KEY (entrega_id) REFERENCES entregas(id_entrega),
   CONSTRAINT fk_asignacion_repartidor
       FOREIGN KEY (repartidor_id) REFERENCES repartidores(id_repartidor)
);

CREATE TABLE historial_estados_entrega (
   id_historial_estado BIGINT AUTO_INCREMENT PRIMARY KEY,
   entrega_id BIGINT NOT NULL,
   estado_anterior VARCHAR(25) NULL,
   estado_nuevo VARCHAR(25) NOT NULL,
   cambiado_por_usuario_id BIGINT NOT NULL,
   comentario TEXT NULL,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT fk_historial_entrega
       FOREIGN KEY (entrega_id) REFERENCES entregas(id_entrega),
   CONSTRAINT chk_historial_estado_anterior
       CHECK (
           estado_anterior IS NULL OR estado_anterior IN (
               'pendiente',
               'asignada',
               'en_preparacion',
               'lista_para_recoger',
               'en_camino',
               'entregada',
               'cancelada',
               'fallida'
           )
       ),
   CONSTRAINT chk_historial_estado_nuevo
       CHECK (
           estado_nuevo IN (
               'pendiente',
               'asignada',
               'en_preparacion',
               'lista_para_recoger',
               'en_camino',
               'entregada',
               'cancelada',
               'fallida'
           )
       )
);

CREATE TABLE incidencias_entrega (
   id_incidencia BIGINT AUTO_INCREMENT PRIMARY KEY,
   entrega_id BIGINT NOT NULL,
   repartidor_id BIGINT NULL,
   tipo_incidencia VARCHAR(30) NOT NULL,
   descripcion TEXT NOT NULL,
   resuelta BOOLEAN NOT NULL DEFAULT FALSE,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   CONSTRAINT fk_incidencia_entrega
       FOREIGN KEY (entrega_id) REFERENCES entregas(id_entrega),
   CONSTRAINT fk_incidencia_repartidor
       FOREIGN KEY (repartidor_id) REFERENCES repartidores(id_repartidor),
   CONSTRAINT chk_tipo_incidencia
       CHECK (tipo_incidencia IN (
           'cliente_no_responde',
           'direccion_incorrecta',
           'problema_en_comercio',
           'pedido_danado',
           'cancelacion_cliente',
           'otro'
       ))
);

-- =========================
-- INDICES
-- =========================

CREATE INDEX idx_entregas_empresa_id ON entregas(empresa_id);
CREATE INDEX idx_entregas_sucursal_id ON entregas(sucursal_id);
CREATE INDEX idx_entregas_cliente_id ON entregas(cliente_id);
CREATE INDEX idx_entregas_repartidor_id ON entregas(repartidor_id);
CREATE INDEX idx_entregas_estado_entrega ON entregas(estado_entrega);

CREATE INDEX idx_asignaciones_entrega_id ON asignaciones_entrega(entrega_id);
CREATE INDEX idx_asignaciones_repartidor_id ON asignaciones_entrega(repartidor_id);
CREATE INDEX idx_asignaciones_activa ON asignaciones_entrega(activa);

CREATE INDEX idx_historial_entrega_id ON historial_estados_entrega(entrega_id);
CREATE INDEX idx_historial_estado_nuevo ON historial_estados_entrega(estado_nuevo);
CREATE INDEX idx_historial_created_at ON historial_estados_entrega(created_at);

CREATE INDEX idx_incidencias_entrega_id ON incidencias_entrega(entrega_id);
CREATE INDEX idx_incidencias_repartidor_id ON incidencias_entrega(repartidor_id);
CREATE INDEX idx_incidencias_tipo ON incidencias_entrega(tipo_incidencia);
CREATE INDEX idx_incidencias_resuelta ON incidencias_entrega(resuelta);
