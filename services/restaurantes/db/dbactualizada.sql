-- ============================================================
-- MODULO RESTAURANTES - BASE DE DATOS (MySQL / MariaDB)
-- Proyecto Arquitectura de Sistemas II
-- ============================================================

CREATE DATABASE IF NOT EXISTS modulo_restaurantes;
USE modulo_restaurantes;


-- ============================================================
-- TABLAS PRINCIPALES
-- ============================================================

CREATE TABLE restaurantes (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    direccion           VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    correo              VARCHAR(100),
    logo_url            VARCHAR(255),
    disponible          BOOLEAN DEFAULT FALSE,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME
);


CREATE TABLE horarios_restaurante (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id      INT NOT NULL,
    dia_semana          TINYINT NOT NULL,         -- 0=Lunes … 6=Domingo (WEEKDAY)
    hora_apertura       TIME NOT NULL,
    hora_cierre         TIME NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


CREATE TABLE tipos_producto (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME
);


CREATE TABLE productos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id      INT NOT NULL,
    tipo_producto_id    INT NOT NULL,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    imagen_url          VARCHAR(255),
    precio              DECIMAL(10,2) NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id)   REFERENCES restaurantes(id),
    FOREIGN KEY (tipo_producto_id) REFERENCES tipos_producto(id)
);


CREATE TABLE historial_precios_producto (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    producto_id     INT NOT NULL,
    precio_anterior DECIMAL(10,2),
    precio_nuevo    DECIMAL(10,2),
    motivo          VARCHAR(255),
    fecha_cambio    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);


-- ============================================================
-- INVENTARIO
-- ============================================================

CREATE TABLE inventario (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    producto_id         INT NOT NULL,
    cantidad_disponible DECIMAL(10,3) NOT NULL DEFAULT 0,
    cantidad_minima     DECIMAL(10,3) NOT NULL DEFAULT 0,
    unidad_medida       VARCHAR(30) NOT NULL,     -- unidades, kg, litros, etc.
    estado              VARCHAR(20) NOT NULL DEFAULT 'disponible',
                        -- disponible | bajo_stock | agotado
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);


CREATE TABLE historial_inventario (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    producto_id         INT NOT NULL,
    tipo_movimiento     VARCHAR(30) NOT NULL,
                        -- entrada | salida_venta | ajuste | merma | devolucion
    cantidad            DECIMAL(10,3) NOT NULL,   -- positiva o negativa
    cantidad_resultante DECIMAL(10,3) NOT NULL,   -- snapshot tras el movimiento
    pedido_id           INT DEFAULT NULL,          -- FK nullable: salida por venta
    detalle_entrada_id  INT DEFAULT NULL,          -- FK nullable: ingreso de proveedor
    usuario_responsable VARCHAR(100),
    observaciones       TEXT,
    fecha_movimiento    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
    -- pedido_id y detalle_entrada_id se agregan como FK al final del script
    -- para evitar forward references
);


-- ============================================================
-- PROVEEDORES Y ENTRADAS
-- ============================================================

CREATE TABLE proveedores (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    telefono            VARCHAR(20),
    correo              VARCHAR(100),
    direccion           VARCHAR(255),
    notas               TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME
);


CREATE TABLE entradas_inventario (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id   INT NOT NULL,
    proveedor_id     INT NOT NULL,
    recibido_por     VARCHAR(100),
    estado           VARCHAR(20) NOT NULL DEFAULT 'pendiente',
                     -- pendiente | recibido | rechazado
    notas            TEXT,
    activo           BOOLEAN DEFAULT TRUE,
    fecha_creacion   DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion  DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (proveedor_id)   REFERENCES proveedores(id)
);


CREATE TABLE detalle_entrada_inventario (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    entrada_id            INT NOT NULL,
    producto_id           INT NOT NULL,
    cantidad_recibida     DECIMAL(10,3) NOT NULL,
    cantidad_rechazada    DECIMAL(10,3) DEFAULT 0,
    precio_unitario_compra DECIMAL(10,2) NOT NULL,
    observaciones         TEXT,
    FOREIGN KEY (entrada_id)   REFERENCES entradas_inventario(id),
    FOREIGN KEY (producto_id)  REFERENCES productos(id)
);


-- ============================================================
-- COMBOS
-- ============================================================

CREATE TABLE tipos_combo (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME
);


CREATE TABLE combos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id      INT NOT NULL,
    tipo_combo_id       INT NOT NULL,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    precio              DECIMAL(10,2) NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (tipo_combo_id)  REFERENCES tipos_combo(id)
);


CREATE TABLE combo_productos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    combo_id    INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad    INT DEFAULT 1,
    FOREIGN KEY (combo_id)    REFERENCES combos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);


-- ============================================================
-- ESTADOS DE PEDIDO
-- ============================================================

CREATE TABLE estados_pedido (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(80) NOT NULL,
    descripcion          TEXT,
    permite_cancelacion  BOOLEAN DEFAULT FALSE,
    activo               BOOLEAN DEFAULT TRUE,
    fecha_creacion       DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  DATETIME
);


-- ============================================================
-- PEDIDOS
-- ============================================================

CREATE TABLE pedidos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id      INT NOT NULL,
    cliente_id          INT NOT NULL,
    repartidor_id       INT DEFAULT NULL,
    estado_id           INT NOT NULL,             -- estado actual (FK a estados_pedido)
    subtotal            DECIMAL(10,2) NOT NULL,
    descuento_aplicado  DECIMAL(10,2) DEFAULT 0,
    total               DECIMAL(10,2) NOT NULL,
    direccion_entrega   VARCHAR(255) NOT NULL,
    notas               TEXT,
    cobro_id            BIGINT DEFAULT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (estado_id)      REFERENCES estados_pedido(id)
);


CREATE TABLE detalle_pedido (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT NOT NULL,
    producto_id     INT DEFAULT NULL,
    combo_id        INT DEFAULT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento       DECIMAL(10,2) DEFAULT 0,
    subtotal        DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id)   REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (combo_id)    REFERENCES combos(id)
);


-- ============================================================
-- HISTORIAL DE ESTADOS DEL PEDIDO
-- (incluye datos de cancelación cuando aplica)
-- ============================================================

CREATE TABLE historial_estados_pedido (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT NOT NULL,
    -- estado_id guardado como dato plano (sin FK) para evitar
    -- relación circular y preservar integridad histórica
    estado_id       INT NOT NULL,
    estado_nombre   VARCHAR(80) NOT NULL,
    motivo          TEXT,
    -- Campos de cancelación (solo se llenan cuando el estado es 'cancelado')
    cancelado_por   VARCHAR(50) DEFAULT NULL,
    aplica_multa    BOOLEAN DEFAULT NULL,
    monto_multa     DECIMAL(10,2) DEFAULT NULL,
    fecha_cambio    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);


-- ============================================================
-- HISTORIAL GENERAL DEL RESTAURANTE
-- ============================================================

CREATE TABLE historial_restaurante (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    tipo_evento    VARCHAR(100),
    descripcion    TEXT,
    referencia_id  INT DEFAULT NULL,
    fecha_evento   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);


-- ============================================================
-- FK DIFERIDAS DE historial_inventario
-- (se agregan aquí para evitar forward references)
-- ============================================================

ALTER TABLE historial_inventario
    ADD CONSTRAINT fk_hinv_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    ADD CONSTRAINT fk_hinv_detalle_entrada
        FOREIGN KEY (detalle_entrada_id) REFERENCES detalle_entrada_inventario(id);


-- ============================================================
-- VISTAS
-- ============================================================

-- Resumen de pedidos con estado actual y datos del restaurante
CREATE VIEW vw_pedidos_resumen AS
SELECT
    p.id                  AS pedido_id,
    r.nombre              AS restaurante,
    p.cliente_id,
    p.repartidor_id,
    e.nombre              AS estado,
    e.permite_cancelacion,
    p.subtotal,
    p.descuento_aplicado,
    p.total,
    p.cobro_id,
    p.fecha_creacion      AS fecha_pedido
FROM pedidos p
JOIN restaurantes  r ON r.id = p.restaurante_id
JOIN estados_pedido e ON e.id = p.estado_id
WHERE p.activo = TRUE;


-- Detalle de cada línea de un pedido (producto o combo)
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
    END                         AS tipo_item,
    COALESCE(p.nombre, c.nombre) AS item_nombre
FROM detalle_pedido d
LEFT JOIN productos p ON p.id = d.producto_id
LEFT JOIN combos    c ON c.id = d.combo_id;


-- Historial completo de un pedido con datos de cancelación si aplica
CREATE VIEW vw_historial_pedido AS
SELECT
    h.pedido_id,
    h.estado_id,
    h.estado_nombre,
    h.motivo,
    h.cancelado_por,
    h.aplica_multa,
    h.monto_multa,
    h.fecha_cambio,
    p.cliente_id,
    p.restaurante_id
FROM historial_estados_pedido h
JOIN pedidos p ON p.id = h.pedido_id;


-- Estado actual del inventario con nombre de producto
CREATE VIEW vw_inventario_actual AS
SELECT
    i.id,
    pr.nombre              AS producto,
    r.nombre               AS restaurante,
    i.cantidad_disponible,
    i.cantidad_minima,
    i.unidad_medida,
    i.estado,
    i.fecha_actualizacion
FROM inventario i
JOIN productos    pr ON pr.id = i.producto_id
JOIN restaurantes r  ON r.id  = pr.restaurante_id
WHERE i.activo = TRUE;


-- Movimientos de inventario con nombre de producto y referencia de origen
CREATE VIEW vw_historial_inventario AS
SELECT
    h.id,
    pr.nombre              AS producto,
    h.tipo_movimiento,
    h.cantidad,
    h.cantidad_resultante,
    h.pedido_id,
    h.detalle_entrada_id,
    h.usuario_responsable,
    h.observaciones,
    h.fecha_movimiento
FROM historial_inventario h
JOIN productos pr ON pr.id = h.producto_id;


-- Entradas de inventario con proveedor y restaurante
CREATE VIEW vw_entradas_inventario AS
SELECT
    e.id                AS entrada_id,
    r.nombre            AS restaurante,
    p.nombre            AS proveedor,
    e.recibido_por,
    e.estado,
    e.notas,
    e.fecha_recepcion,
    e.fecha_creacion
FROM entradas_inventario e
JOIN restaurantes r ON r.id = e.restaurante_id
JOIN proveedores  p ON p.id = e.proveedor_id
WHERE e.activo = TRUE;


-- ============================================================
-- FUNCIONES
-- ============================================================

DELIMITER $$

-- Valida si un restaurante está en horario en una fecha/hora dada
CREATE FUNCTION restaurante_en_horario(p_restaurante_id INT, p_fecha DATETIME)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_dia   TINYINT;
    DECLARE v_hora  TIME;
    DECLARE v_count INT;

    SET v_dia  = WEEKDAY(p_fecha);
    SET v_hora = TIME(p_fecha);

    SELECT COUNT(*) INTO v_count
    FROM horarios_restaurante
    WHERE restaurante_id = p_restaurante_id
      AND dia_semana     = v_dia
      AND activo         = TRUE
      AND v_hora BETWEEN hora_apertura AND hora_cierre;

    RETURN v_count > 0;
END$$


-- Devuelve el estado actual (nombre) de un pedido
CREATE FUNCTION fn_estado_actual_pedido(p_pedido_id INT)
RETURNS VARCHAR(80)
DETERMINISTIC
BEGIN
    DECLARE v_estado VARCHAR(80);

    SELECT e.nombre INTO v_estado
    FROM pedidos p
    JOIN estados_pedido e ON e.id = p.estado_id
    WHERE p.id = p_pedido_id;

    RETURN v_estado;
END$$

DELIMITER ;


-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$

-- Crea un pedido nuevo y registra el primer evento en el historial
CREATE PROCEDURE sp_crear_pedido(
    IN p_restaurante_id  INT,
    IN p_cliente_id      INT,
    IN p_direccion       VARCHAR(255),
    IN p_notas           TEXT,
    IN p_subtotal        DECIMAL(10,2),
    IN p_descuento       DECIMAL(10,2),
    IN p_total           DECIMAL(10,2)
)
BEGIN
    DECLARE v_pedido_id   INT;
    DECLARE v_estado_nombre VARCHAR(80);

    INSERT INTO pedidos (
        restaurante_id,
        cliente_id,
        estado_id,
        subtotal,
        descuento_aplicado,
        total,
        direccion_entrega,
        notas
    ) VALUES (
        p_restaurante_id,
        p_cliente_id,
        1,              -- estado: pendiente
        p_subtotal,
        p_descuento,
        p_total,
        p_direccion,
        p_notas
    );

    SET v_pedido_id = LAST_INSERT_ID();

    SELECT nombre INTO v_estado_nombre
    FROM estados_pedido WHERE id = 1;

    INSERT INTO historial_estados_pedido (
        pedido_id,
        estado_id,
        estado_nombre,
        motivo
    ) VALUES (
        v_pedido_id,
        1,
        v_estado_nombre,
        'Creación de pedido'
    );
END$$


-- Cambia el estado de un pedido y registra el evento en el historial
CREATE PROCEDURE sp_cambiar_estado_pedido(
    IN p_pedido_id  INT,
    IN p_estado_id  INT,
    IN p_motivo     TEXT
)
BEGIN
    DECLARE v_estado_nombre    VARCHAR(80);
    DECLARE v_permite_cambio   BOOLEAN;

    -- Validar que el estado destino esté activo
    SELECT nombre, activo
    INTO v_estado_nombre, v_permite_cambio
    FROM estados_pedido
    WHERE id = p_estado_id;

    IF v_permite_cambio = FALSE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estado destino no está activo.';
    END IF;

    -- Actualizar estado actual en pedidos
    UPDATE pedidos
    SET estado_id           = p_estado_id,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = p_pedido_id;

    -- Registrar en historial (sin FK a estados_pedido, dato copiado)
    INSERT INTO historial_estados_pedido (
        pedido_id,
        estado_id,
        estado_nombre,
        motivo
    ) VALUES (
        p_pedido_id,
        p_estado_id,
        v_estado_nombre,
        p_motivo
    );
END$$


-- Cancela un pedido: valida que el estado permita cancelación,
-- cambia el estado y registra en historial con datos de cancelación
CREATE PROCEDURE sp_cancelar_pedido(
    IN p_pedido_id    INT,
    IN p_cancelado_por VARCHAR(50),
    IN p_motivo       TEXT,
    IN p_aplica_multa BOOLEAN,
    IN p_monto_multa  DECIMAL(10,2)
)
BEGIN
    DECLARE v_estado_id         INT;
    DECLARE v_permite_cancelar  BOOLEAN;
    DECLARE v_estado_cancelado  INT;
    DECLARE v_estado_nombre     VARCHAR(80);

    -- Obtener estado actual del pedido
    SELECT estado_id INTO v_estado_id
    FROM pedidos WHERE id = p_pedido_id;

    -- Verificar si el estado actual permite cancelación
    SELECT permite_cancelacion INTO v_permite_cancelar
    FROM estados_pedido WHERE id = v_estado_id;

    IF v_permite_cancelar = FALSE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pedido no puede cancelarse en su estado actual.';
    END IF;

    -- Obtener id y nombre del estado 'cancelado'
    SELECT id, nombre INTO v_estado_cancelado, v_estado_nombre
    FROM estados_pedido WHERE nombre = 'cancelado' LIMIT 1;

    -- Actualizar estado en pedidos
    UPDATE pedidos
    SET estado_id           = v_estado_cancelado,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = p_pedido_id;

    -- Registrar en historial con datos de cancelación
    INSERT INTO historial_estados_pedido (
        pedido_id,
        estado_id,
        estado_nombre,
        motivo,
        cancelado_por,
        aplica_multa,
        monto_multa
    ) VALUES (
        p_pedido_id,
        v_estado_cancelado,
        v_estado_nombre,
        p_motivo,
        p_cancelado_por,
        p_aplica_multa,
        p_monto_multa
    );
END$$


-- Registra una entrada de inventario y actualiza el stock de cada producto
CREATE PROCEDURE sp_registrar_entrada_inventario(
    IN p_entrada_id         INT,
    IN p_usuario            VARCHAR(100)
)
BEGIN
    DECLARE done          INT DEFAULT 0;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad    DECIMAL(10,3);
    DECLARE v_detalle_id  INT;
    DECLARE v_cant_actual DECIMAL(10,3);
    DECLARE v_cant_nueva  DECIMAL(10,3);
    DECLARE v_estado      VARCHAR(20);
    DECLARE v_min         DECIMAL(10,3);

    -- Cursor sobre los detalles de la entrada
    DECLARE cur CURSOR FOR
        SELECT id, producto_id, cantidad_recibida
        FROM detalle_entrada_inventario
        WHERE entrada_id = p_entrada_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    loop_detalle: LOOP
        FETCH cur INTO v_detalle_id, v_producto_id, v_cantidad;
        IF done THEN LEAVE loop_detalle; END IF;

        -- Cantidad actual en inventario
        SELECT cantidad_disponible, cantidad_minima
        INTO v_cant_actual, v_min
        FROM inventario
        WHERE producto_id = v_producto_id;

        SET v_cant_nueva = v_cant_actual + v_cantidad;

        -- Determinar nuevo estado
        IF v_cant_nueva <= 0 THEN
            SET v_estado = 'agotado';
        ELSEIF v_cant_nueva <= v_min THEN
            SET v_estado = 'bajo_stock';
        ELSE
            SET v_estado = 'disponible';
        END IF;

        -- Actualizar inventario
        UPDATE inventario
        SET cantidad_disponible = v_cant_nueva,
            estado              = v_estado,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE producto_id = v_producto_id;

        -- Registrar en historial_inventario
        INSERT INTO historial_inventario (
            producto_id,
            tipo_movimiento,
            cantidad,
            cantidad_resultante,
            detalle_entrada_id,
            usuario_responsable
        ) VALUES (
            v_producto_id,
            'entrada',
            v_cantidad,
            v_cant_nueva,
            v_detalle_id,
            p_usuario
        );

    END LOOP;
    CLOSE cur;

    -- Marcar la entrada como recibida
    UPDATE entradas_inventario
    SET estado         = 'recibido',
        fecha_recepcion = CURRENT_TIMESTAMP
    WHERE id = p_entrada_id;
END$$

DELIMITER ;