# Endpoints del Servicio de Restaurantes

Base URL: `http://localhost:3000/api`

## 🏪 Restaurantes

### GET `/restaurantes`
Obtener todos los restaurantes
- **Query params**: `activo` (boolean)
- **Auth**: No requerida
- **Response**: Array de restaurantes con horarios

### GET `/restaurantes/:id`
Obtener un restaurante por ID
- **Auth**: No requerida
- **Response**: Restaurante con horarios

### POST `/restaurantes`
Crear un restaurante
- **Auth**: Requerida (Admin)
- **Body**: `{ nombre, direccion, telefono?, email?, descripcion? }`
- **Response**: Restaurante creado

### PUT `/restaurantes/:id`
Actualizar un restaurante
- **Auth**: Requerida (Admin)
- **Body**: Campos a actualizar
- **Response**: Restaurante actualizado

### DELETE `/restaurantes/:id`
Inactivar un restaurante
- **Auth**: Requerida (Admin)
- **Response**: Mensaje de confirmación

---

## 🕐 Horarios

### GET `/horarios/:restauranteId`
Obtener horarios de un restaurante
- **Auth**: No requerida
- **Response**: Array de horarios

### POST `/horarios/:restauranteId`
Crear/actualizar horarios de un restaurante
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: `{ horarios: [{ diaSemana, horaApertura, horaCierre, cerrado }] }`
- **Response**: Horarios actualizados

---

## 🍔 Productos

### GET `/productos`
Obtener productos
- **Query params**: `restauranteId`, `disponible`, `activo`
- **Auth**: No requerida
- **Response**: Array de productos con precios y tipos

### POST `/productos`
Crear un producto
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: `{ restauranteId, tipoProductoId, nombre, descripcion?, disponible? }`
- **Response**: Producto creado

### PUT `/productos/:id`
Actualizar un producto
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: Campos a actualizar
- **Response**: Producto actualizado

### DELETE `/productos/:id`
Inactivar un producto
- **Auth**: Requerida (Admin, Restaurante)
- **Response**: Mensaje de confirmación

---

## 🎁 Combos

### GET `/combos`
Obtener combos
- **Query params**: `restauranteId`, `disponible`, `activo`
- **Auth**: No requerida
- **Response**: Array de combos con precios y tipos

### POST `/combos`
Crear un combo
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: `{ restauranteId, tipoComboId, nombre, descripcion?, disponible? }`
- **Response**: Combo creado

### PUT `/combos/:id`
Actualizar un combo
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: Campos a actualizar
- **Response**: Combo actualizado

### DELETE `/combos/:id`
Inactivar un combo
- **Auth**: Requerida (Admin, Restaurante)
- **Response**: Mensaje de confirmación

---

## 💰 Precios

### GET `/precios/actual`
Obtener precio actual
- **Query params**: `productoId` o `comboId`
- **Auth**: No requerida
- **Response**: Precio vigente

### POST `/precios`
Crear un precio
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: `{ productoId?, comboId?, precio, fechaInicio?, fechaFin? }`
- **Response**: Precio creado

---

## 🏷️ Descuentos

### GET `/descuentos`
Obtener descuentos activos
- **Query params**: `restauranteId`, `productoId`, `comboId`
- **Auth**: No requerida
- **Response**: Array de descuentos vigentes

### POST `/descuentos`
Crear un descuento
- **Auth**: Requerida (Admin, Restaurante)
- **Body**: `{ restauranteId, productoId?, comboId?, nombre, tipo, valor, fechaInicio, fechaFin }`
- **Response**: Descuento creado

---

## 📦 Pedidos

### GET `/pedidos`
Obtener pedidos
- **Query params**: `restauranteId`, `clienteId`, `estado`
- **Auth**: Requerida
- **Response**: Array de pedidos

### POST `/pedidos`
Crear un pedido
- **Auth**: Requerida
- **Body**: `{ restauranteId, subtotal, descuento?, total, observaciones? }`
- **Response**: Pedido creado

### PATCH `/pedidos/:id/cancelar`
Cancelar un pedido
- **Auth**: Requerida
- **Body**: `{ motivo? }`
- **Response**: Pedido cancelado + multa (si aplica)

### PATCH `/pedidos/:id/estado`
Actualizar estado de un pedido
- **Auth**: Requerida
- **Body**: `{ estado }`
- **Response**: Pedido actualizado

---

## 🔐 Autenticación

Todas las rutas protegidas requieren header:
```
Authorization: Bearer <token>
```

**Roles disponibles**: `admin`, `restaurante`, `cliente`
