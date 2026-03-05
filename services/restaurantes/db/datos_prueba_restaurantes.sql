
-- ============================================================
-- DATOS DE PRUEBA - MODULO RESTAURANTES
-- Compatible con MySQL / MariaDB
-- Incluye datos para probar:
-- restaurantes, horarios, productos, combos, pedidos
-- ============================================================

USE modulo_restaurantes;

-- ============================
-- RESTAURANTES
-- ============================
INSERT INTO restaurantes (nombre, descripcion, direccion, telefono, correo, disponible) VALUES
('Pizza Planet','Pizzeria italiana','Zona 10 Guatemala','55550001','pizza@planet.com',true),
('Burger City','Hamburguesas gourmet','Zona 15 Guatemala','55550002','burger@city.com',true),
('Tacos Express','Comida mexicana','Zona 1 Guatemala','55550003','tacos@express.com',true),
('Sushi House','Sushi y comida japonesa','Zona 9 Guatemala','55550004','sushi@house.com',true),
('Pollo Feliz','Pollo frito','Zona 5 Guatemala','55550005','pollo@feliz.com',true),
('Pasta Italia','Pastas italianas','Zona 14 Guatemala','55550006','pasta@italia.com',true),
('BBQ Grill','Carnes a la parrilla','Zona 12 Guatemala','55550007','bbq@grill.com',true),
('Healthy Food','Comida saludable','Zona 13 Guatemala','55550008','healthy@food.com',true),
('Donuts Sweet','Donas y postres','Zona 4 Guatemala','55550009','donuts@sweet.com',true),
('Coffee Corner','Café y bebidas','Zona 16 Guatemala','55550010','coffee@corner.com',true);

-- ============================
-- HORARIOS
-- ============================
INSERT INTO horarios_restaurante (restaurante_id, dia_semana, hora_apertura, hora_cierre) VALUES
(1,0,'09:00','22:00'),
(2,0,'10:00','23:00'),
(3,0,'08:00','20:00'),
(4,0,'11:00','22:00'),
(5,0,'09:00','21:00'),
(6,0,'10:00','22:00'),
(7,0,'11:00','23:00'),
(8,0,'08:00','19:00'),
(9,0,'10:00','21:00'),
(10,0,'07:00','18:00');

-- ============================
-- TIPOS DE PRODUCTO
-- ============================
INSERT INTO tipos_producto (nombre, descripcion) VALUES
('Bebida','Refrescos y bebidas'),
('Comida Principal','Platillos principales'),
('Postre','Postres'),
('Entrada','Entradas o aperitivos');

-- ============================
-- PRODUCTOS
-- ============================
INSERT INTO productos (restaurante_id, tipo_producto_id, nombre, descripcion, precio) VALUES
(1,2,'Pizza Pepperoni','Pizza mediana pepperoni',80),
(1,2,'Pizza Hawaiana','Pizza con piña',85),
(2,2,'Hamburguesa Clasica','Hamburguesa con queso',60),
(2,1,'Coca Cola','Bebida 355ml',10),
(3,2,'Tacos al Pastor','Orden de tacos',35),
(3,1,'Horchata','Bebida tradicional',12),
(4,2,'Sushi Roll','Roll de sushi',90),
(5,2,'Pollo Frito','Combo pollo frito',70),
(6,2,'Spaghetti Bolognese','Pasta italiana',75),
(7,2,'Costillas BBQ','Costillas con salsa',95);

-- ============================
-- TIPOS COMBO
-- ============================
INSERT INTO tipos_combo (nombre, descripcion) VALUES
('Combo Personal','Para una persona'),
('Combo Familiar','Para compartir');

-- ============================
-- COMBOS
-- ============================
INSERT INTO combos (restaurante_id, tipo_combo_id, nombre, descripcion, precio) VALUES
(2,1,'Combo Burger','Hamburguesa + Coca Cola',65),
(1,1,'Combo Pizza','Pizza Pepperoni + bebida',90),
(5,1,'Combo Pollo','Pollo + bebida',75),
(7,1,'Combo BBQ','Costillas + bebida',100),
(4,1,'Combo Sushi','Sushi + bebida',95);

-- ============================
-- PRODUCTOS EN COMBOS
-- ============================
INSERT INTO combo_productos (combo_id, producto_id, cantidad) VALUES
(1,3,1),
(1,4,1),
(2,1,1),
(2,4,1),
(3,8,1),
(4,10,1),
(5,7,1);

-- ============================
-- PEDIDOS
-- ============================
INSERT INTO pedidos (restaurante_id, cliente_id, estado_id, subtotal, descuento_aplicado, total, direccion_entrega, notas) VALUES
(1,101,1,80,0,80,'Zona 10','Sin cebolla'),
(2,102,1,65,0,65,'Zona 15','Extra queso'),
(3,103,1,35,0,35,'Zona 1','Sin salsa'),
(4,104,1,90,5,85,'Zona 9','Entrega rápida'),
(5,105,1,70,0,70,'Zona 5',''),
(6,106,1,75,0,75,'Zona 14',''),
(7,107,1,95,0,95,'Zona 12',''),
(8,108,1,50,0,50,'Zona 13',''),
(9,109,1,30,0,30,'Zona 4',''),
(10,110,1,25,0,25,'Zona 16','');

-- ============================
-- DETALLE PEDIDO
-- ============================
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1,1,1,80,80),
(2,3,1,60,60),
(3,5,1,35,35),
(4,7,1,90,90),
(5,8,1,70,70),
(6,9,1,75,75),
(7,10,1,95,95),
(8,4,2,10,20),
(9,6,1,12,12),
(10,4,1,10,10);

-- ============================
-- HISTORIAL ESTADOS
-- ============================
INSERT INTO historial_estados_pedido (pedido_id, estado_id, motivo) VALUES
(1,1,'Pedido creado'),
(2,1,'Pedido creado'),
(3,1,'Pedido creado'),
(4,1,'Pedido creado'),
(5,1,'Pedido creado'),
(6,1,'Pedido creado'),
(7,1,'Pedido creado'),
(8,1,'Pedido creado'),
(9,1,'Pedido creado'),
(10,1,'Pedido creado');
