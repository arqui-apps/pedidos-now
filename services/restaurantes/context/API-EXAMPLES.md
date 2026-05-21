# Guía de Uso de la API - Ejemplos Prácticos

**Base URL**: `http://localhost:3000/api`

---

## 📋 Índice
1. [Restaurantes](#restaurantes)
2. [Horarios](#horarios)
3. [Productos](#productos)
4. [Precios](#precios)
5. [Combos](#combos)
6. [Pedidos](#pedidos)

---

## 🏪 Restaurantes

### Listar todos los restaurantes
```http
GET /api/restaurantes
GET /api/restaurantes?activo=true
GET /api/restaurantes?disponible=true
```

### Obtener un restaurante específico
```http
GET /api/restaurantes/1
```

### Crear un restaurante
```http
POST /api/restaurantes
Content-Type: application/json

{
  "nombre": "Pizza Hut Centro",
  "descripcion": "Las mejores pizzas de la ciudad",
  "direccion": "Av. Principal 123",
  "telefono": "555-1234",
  "correo": "contacto@pizzahut.com",
  "logo_url": "https://example.com/logo.png",
  "disponible": true
}
```

### Actualizar un restaurante
```http
PUT /api/restaurantes/1
Content-Type: application/json

{
  "nombre": "Pizza Hut Centro - Sucursal 1",
  "disponible": false
}
```

### Cambiar disponibilidad
```http
PATCH /api/restaurantes/1/disponibilidad
Content-Type: application/json

{
  "disponible": true
}
```

---

## 🕐 Horarios

### Obtener horarios de un restaurante
```http
GET /api/restaurantes/1/horarios
GET /api/restaurantes/1/horarios?activo=true
```

### Crear horario
```http
POST /api/restaurantes/1/horarios
Content-Type: application/json

{
  "dia_semana": 0,
  "hora_apertura": "08:00:00",
  "hora_cierre": "22:00:00"
}
```

**Días de la semana**: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo

### Actualizar horario
```http
PUT /api/restaurantes/1/horarios/5
Content-Type: application/json

{
  "hora_apertura": "09:00:00",
  "hora_cierre": "23:00:00"
}
```

### Inactivar horario
```http
DELETE /api/restaurantes/1/horarios/5
```

---

## 🍔 Productos

### Listar productos de un restaurante
```http
GET /api/restaurantes/1/productos
GET /api/restaurantes/1/productos?activo=true
```

### Obtener un producto específico
```http
GET /api/restaurantes/1/productos/5
```

### Crear producto
```http
POST /api/restaurantes/1/productos
Content-Type: application/json

{
  "tipo_producto_id": 1,
  "nombre": "Pizza Margarita",
  "descripcion": "Pizza con queso mozzarella y albahaca",
  "imagen_url": "https://example.com/pizza.jpg",
  "precio": 45.50
}
```

**Nota**: Ya NO se envía `restaurante_id` en el body, viene en la URL.

### Actualizar producto
```http
PUT /api/restaurantes/1/productos/5
Content-Type: application/json

{
  "nombre": "Pizza Margarita Grande",
  "precio": 55.00
}
```

### Inactivar producto
```http
DELETE /api/restaurantes/1/productos/5
```

### Activar/desactivar producto
```http
PATCH /api/restaurantes/1/productos/5/activo
Content-Type: application/json

{
  "activo": true
}
```

---

## 💰 Precios

### Obtener precio actual
```http
GET /api/restaurantes/1/productos/5/precio/actual
```

**Response:**
```json
{
  "success": true,
  "data": {
    "producto_id": 5,
    "nombre": "Pizza Margarita",
    "precio_actual": 45.50
  }
}
```

### Obtener historial de precios
```http
GET /api/restaurantes/1/productos/5/precio/historial
```

### Actualizar precio
```http
PUT /api/restaurantes/1/productos/5/precio
Content-Type: application/json

{
  "precio_nuevo": 50.00,
  "motivo": "Incremento por inflación"
}
```

### Comparar precios entre fechas
```http
GET /api/restaurantes/1/productos/5/precio/comparar?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
```

---

## 🎁 Combos

### Listar combos de un restaurante
```http
GET /api/restaurantes/1/combos
```

### Crear combo
```http
POST /api/restaurantes/1/combos
Content-Type: application/json

{
  "tipo_combo_id": 1,
  "nombre": "Combo Familiar",
  "descripcion": "2 pizzas grandes + refresco 2L",
  "precio": 120.00,
  "productos": [
    {
      "producto_id": 5,
      "cantidad": 2
    },
    {
      "producto_id": 8,
      "cantidad": 1
    }
  ]
}
```

### Agregar productos a un combo
```http
POST /api/restaurantes/1/combos/3/productos
Content-Type: application/json

{
  "productos": [
    {
      "producto_id": 10,
      "cantidad": 1
    }
  ]
}
```

### Remover producto de un combo
```http
DELETE /api/restaurantes/1/combos/3/productos/10
```

---

## 📦 Pedidos

### Listar pedidos de un restaurante
```http
GET /api/restaurantes/1/pedidos
GET /api/restaurantes/1/pedidos?cliente_id=100
GET /api/restaurantes/1/pedidos?estado_id=1
```

### Crear pedido
```http
POST /api/restaurantes/1/pedidos
Content-Type: application/json

{
  "cliente_id": 100,
  "direccion_entrega": "Calle Falsa 123, Apto 4B",
  "notas": "Sin cebolla, por favor",
  "descuento_aplicado": 5.00,
  "items": [
    {
      "producto_id": 5,
      "cantidad": 2,
      "descuento": 0
    },
    {
      "combo_id": 3,
      "cantidad": 1,
      "descuento": 0
    }
  ]
}
```

**Nota**: El sistema calcula automáticamente `subtotal` y `total`.

### Obtener un pedido
```http
GET /api/restaurantes/1/pedidos/10
```

**Response incluye:**
- Datos del pedido
- Estado actual
- Detalles de items
- Historial de cambios de estado

### Actualizar pedido
```http
PUT /api/restaurantes/1/pedidos/10
Content-Type: application/json

{
  "direccion_entrega": "Nueva dirección",
  "repartidor_id": 50,
  "cobro_id": 1001
}
```

### Cambiar estado del pedido
```http
PUT /api/restaurantes/1/pedidos/10/estado
Content-Type: application/json

{
  "estado_id": 2,
  "motivo": "Pedido confirmado por el restaurante"
}
```

**Estados disponibles:**
- 1 = pendiente
- 2 = confirmado
- 3 = en_preparacion
- 4 = listo
- 5 = en_camino
- 6 = entregado
- 7 = cancelado

---

## 📋 Detalles de Pedido

### Listar detalles de un pedido
```http
GET /api/restaurantes/1/pedidos/10/detalles
```

### Agregar ítem al pedido
```http
POST /api/restaurantes/1/pedidos/10/detalles
Content-Type: application/json

{
  "producto_id": 8,
  "cantidad": 1,
  "descuento": 0
}
```

### Actualizar detalle
```http
PUT /api/restaurantes/1/pedidos/10/detalles/15
Content-Type: application/json

{
  "cantidad": 3,
  "descuento": 2.50
}
```

### Eliminar ítem del pedido
```http
DELETE /api/restaurantes/1/pedidos/10/detalles/15
```

---

## 📊 Historial de Estados

### Ver historial de cambios de un pedido
```http
GET /api/restaurantes/1/pedidos/10/historial
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pedido_id": 10,
      "estado_id": 1,
      "fecha_cambio": "2024-03-17T10:00:00",
      "motivo": "Pedido creado",
      "estado": { "nombre": "pendiente" }
    },
    {
      "id": 2,
      "pedido_id": 10,
      "estado_id": 2,
      "fecha_cambio": "2024-03-17T10:05:00",
      "motivo": "Confirmado por restaurante",
      "estado": { "nombre": "confirmado" }
    }
  ],
  "count": 2
}
```

---

## ❌ Cancelación de Pedidos

### Cancelar pedido
```http
POST /api/restaurantes/1/pedidos/10/cancelacion/cancelar
Content-Type: application/json

{
  "cancelado_por": "cliente",
  "motivo": "Cambio de planes"
}
```

**Opciones de `cancelado_por`:**
- `cliente`
- `restaurante`
- `repartidor`
- `sistema`

**Multas aplicadas:**
- **Restaurante**: 10% del total si cancela en estados 2-5
- **Cliente**: 5% del total si cancela en estados 3-5

### Obtener información de cancelación
```http
GET /api/restaurantes/1/pedidos/10/cancelacion
```

---

## 📝 Respuestas de Error

### Restaurante no encontrado
```json
{
  "success": false,
  "message": "Restaurante no encontrado"
}
```

### Producto no pertenece al restaurante
```json
{
  "success": false,
  "message": "Producto no encontrado en este restaurante"
}
```

### Validación de campos
```json
{
  "success": false,
  "message": "La cantidad debe ser mayor a 0"
}
```

---

## 🔐 Autenticación (Futuro)

Todas las rutas protegidas requerirán:
```http
Authorization: Bearer <token_jwt>
```

---

## 💡 Tips

1. **Siempre incluir restaurante_id en la URL**, no en el body
2. **Los IDs se validan automáticamente** contra el restaurante
3. **Los precios se calculan automáticamente** en pedidos y detalles
4. **Los estados de pedido son progresivos**, no se puede saltar estados
5. **Las cancelaciones generan multas** según el estado del pedido

---

**Última actualización**: 2024-03-17
