
-- ============================================================
-- MODULO RESTAURANTES - BASE DE DATOS (MySQL / MariaDB)
-- Proyecto Arquitectura de Sistemas II
-- Incluye:
--   - Tablas principales
--   - Relaciones
--   - Vistas
--   - Funciones
--   - Stored Procedures
-- ============================================================
CREATE DATABASE modulo_restaurantes;
USE modulo_restaurantes;
-- =============================
-- TABLAS PRINCIPALES
-- =============================

CREATE TABLE restaurantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    logo_url VARCHAR(255),
    disponible BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME
);

CREATE TABLE horarios_restaurante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    dia_semana TINYINT NOT NULL,
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);

CREATE TABLE tipos_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    tipo_producto_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (tipo_producto_id) REFERENCES tipos_producto(id)
);

CREATE TABLE historial_precios_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    precio_anterior DECIMAL(10,2),
    precio_nuevo DECIMAL(10,2),
    motivo VARCHAR(255),
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE tipos_combo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    tipo_combo_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (tipo_combo_id) REFERENCES tipos_combo(id)
);

CREATE TABLE combo_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combo_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (combo_id) REFERENCES combos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE estados_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    cliente_id INT NOT NULL,
    repartidor_id INT,
    estado_id INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento_aplicado DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    direccion_entrega VARCHAR(255) NOT NULL,
    notas TEXT,
    cobro_id BIGINT,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (estado_id) REFERENCES estados_pedido(id)
);

CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT,
    combo_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (combo_id) REFERENCES combos(id)
);

CREATE TABLE historial_estados_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    estado_id INT NOT NULL,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(255),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (estado_id) REFERENCES estados_pedido(id)
);

CREATE TABLE cancelaciones_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    cancelado_por VARCHAR(50),
    motivo TEXT,
    estado_al_cancelar VARCHAR(80),
    aplica_multa BOOLEAN DEFAULT FALSE,
    monto_multa DECIMAL(10,2) DEFAULT 0,
    fecha_cancelacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE TABLE historial_restaurante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    tipo_evento VARCHAR(100),
    descripcion TEXT,
    referencia_id INT,
    fecha_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- =============================
-- DATOS BASE DE ESTADOS
-- =============================

INSERT INTO estados_pedido(nombre, descripcion) VALUES
('pendiente','Pedido creado'),
('confirmado','Restaurante confirmó el pedido'),
('en_preparacion','Pedido en preparación'),
('listo','Pedido listo'),
('en_camino','Repartidor en camino'),
('entregado','Pedido entregado'),
('cancelado','Pedido cancelado');


-- =============================
-- VISTAS
-- =============================

CREATE VIEW vw_pedidos_resumen AS
SELECT
  p.id pedido_id,
  r.nombre restaurante,
  p.cliente_id,
  p.repartidor_id,
  e.nombre estado,
  p.subtotal,
  p.descuento_aplicado,
  p.total,
  p.cobro_id,
  p.fecha_pedido
FROM pedidos p
JOIN restaurantes r ON r.id = p.restaurante_id
JOIN estados_pedido e ON e.id = p.estado_id;


CREATE VIEW vw_detalle_pedido AS
SELECT
  d.pedido_id,
  d.cantidad,
  d.precio_unitario,
  d.descuento,
  d.subtotal,
  CASE
    WHEN d.producto_id IS NOT NULL THEN 'PRODUCTO'
    ELSE 'COMBO'
  END AS tipo_item,
  COALESCE(p.nombre, c.nombre) AS item_nombre
FROM detalle_pedido d
LEFT JOIN productos p ON p.id = d.producto_id
LEFT JOIN combos c ON c.id = d.combo_id;


-- =============================
-- FUNCION: VALIDAR HORARIO
-- =============================

DELIMITER $$

CREATE FUNCTION restaurante_en_horario(p_restaurante_id INT, p_fecha DATETIME)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  DECLARE v_dia TINYINT;
  DECLARE v_hora TIME;
  DECLARE v_count INT;

  SET v_dia = WEEKDAY(p_fecha);
  SET v_hora = TIME(p_fecha);

  SELECT COUNT(*)
  INTO v_count
  FROM horarios_restaurante
  WHERE restaurante_id = p_restaurante_id
    AND dia_semana = v_dia
    AND activo = TRUE
    AND v_hora BETWEEN hora_apertura AND hora_cierre;

  RETURN v_count > 0;
END$$

DELIMITER ;


-- =============================
-- PROCEDIMIENTO CREAR PEDIDO
-- =============================

DELIMITER $$

CREATE PROCEDURE sp_crear_pedido(
  IN p_restaurante_id INT,
  IN p_cliente_id INT,
  IN p_direccion VARCHAR(255),
  IN p_notas TEXT,
  IN p_subtotal DECIMAL(10,2),
  IN p_descuento DECIMAL(10,2),
  IN p_total DECIMAL(10,2)
)
BEGIN

  INSERT INTO pedidos(
    restaurante_id,
    cliente_id,
    estado_id,
    subtotal,
    descuento_aplicado,
    total,
    direccion_entrega,
    notas
  )
  VALUES (
    p_restaurante_id,
    p_cliente_id,
    1,
    p_subtotal,
    p_descuento,
    p_total,
    p_direccion,
    p_notas
  );

  INSERT INTO historial_estados_pedido(pedido_id, estado_id, motivo)
  VALUES (LAST_INSERT_ID(), 1, 'Creación de pedido');

END$$

DELIMITER ;
