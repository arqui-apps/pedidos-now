CREATE DATABASE paqueteria_db;
USE paqueteria_db;

-- =========================
-- TABLE: courier (Repartidor)
-- =========================
CREATE TABLE courier (
    id_courier INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT TRUE
);

-- =========================
-- TABLE: user (Usuario)
-- =========================
CREATE TABLE user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT TRUE
);

-- =========================
-- TABLE: address (Direccion)
-- =========================
CREATE TABLE address (
    id_address INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address VARCHAR(255),

    CONSTRAINT fk_address_user
        FOREIGN KEY (id_user)
        REFERENCES user(id_user)
);

-- =========================
-- TABLE: prices (Precios)
-- =========================
CREATE TABLE prices (
    id_price INT AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(10,2),
    criteria VARCHAR(100),
    status BOOLEAN DEFAULT TRUE
);

-- =========================
-- TABLE: shipment (Envio)
-- =========================
CREATE TABLE shipment (
    id_shipment INT AUTO_INCREMENT PRIMARY KEY,
    delivery_instructions TEXT,
    total DECIMAL(10,2),
    shipment_status ENUM('pending','assigned','in_transit','delivered','cancelled'),
    charge_type VARCHAR(50),
    estimated_delivery_time DATETIME,
    sender_id INT,
    receiver_id INT,
    courier_id INT,
    created_at DATETIME,
    updated_at DATETIME,
    invoice_series VARCHAR(50),
    status BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_shipment_sender
        FOREIGN KEY (sender_id)
        REFERENCES user(id_user),

    CONSTRAINT fk_shipment_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES user(id_user),

    CONSTRAINT fk_shipment_courier
        FOREIGN KEY (courier_id)
        REFERENCES courier(id_courier)
);

-- =========================
-- TABLE: package (Paquete)
-- =========================
CREATE TABLE package (
    id_package INT AUTO_INCREMENT PRIMARY KEY,
    id_shipment INT NOT NULL,
    description VARCHAR(255),
    size VARCHAR(50),
    weight DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    status BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_package_shipment
        FOREIGN KEY (id_shipment)
        REFERENCES shipment(id_shipment)
);

-- =========================
-- TABLE: courier_status_type (Tipos de estado del repartidor)
-- =========================
CREATE TABLE courier_status_type (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los estados por defecto
INSERT INTO courier_status_type (name, description) VALUES
('Disponible', 'Repartidor en línea y puede tomar pedidos'),
('Ocupado', 'Repartidor tiene un pedido en curso'),
('Desconectado', 'Repartidor no está en la aplicación'),
('Inactivo', 'Repartidor ya no trabaja en la aplicación (borrado lógico)');

-- =========================
-- TABLE: courier_status (Estado actual del repartidor)
-- =========================
CREATE TABLE courier_status (
    id_courier_status INT AUTO_INCREMENT PRIMARY KEY,
    id_courier INT NOT NULL UNIQUE,
    id_status INT NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_courier_status_courier
        FOREIGN KEY (id_courier)
        REFERENCES courier(id_courier) ON DELETE CASCADE,

    CONSTRAINT fk_courier_status_type
        FOREIGN KEY (id_status)
        REFERENCES courier_status_type(id_status)
);
