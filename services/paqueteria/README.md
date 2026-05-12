# Microservicio de Paquetería Instantánea

## URL Base en la nube

**Base URL**: `https://pedidos-now-backend.onrender.com/`

Todos los endpoints disponibles deben usarse con el prefijo `/api`.

> Ejemplo: `https://pedidos-now-backend.onrender.com/api/packages`

---

## Encabezados y parámetros comunes

- `Content-Type: application/json` para requests que envían JSON.
- `x-customer-token: <cliente_id>` se usa en endpoints donde el receptor o el remitente deben validar la acción.
- Alternativamente, algunos endpoints aceptan `customerToken` como query string.

> Nota: en el servicio actual, el `x-customer-token` se trata de forma simplificada como el `receiverId` o `senderId` numérico.

---

## Endpoints y ejemplos

### 📦 Paquetes (Packages)

#### 1. Generar cotización de envío

- URL: `POST /api/packages/quote`
- Body:
  - `senderId`: ID del remitente
  - `receiverId`: ID del receptor
  - `packageDetails`: detalles del paquete
  - `originAddress`: dirección de origen
  - `destinationAddress`: dirección de destino

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/packages/quote`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "senderId": 1,
  "receiverId": 2,
  "packageDetails": {
    "description": "Laptop",
    "weight": 3.5,
    "size": "40x30x20 cm"
  },
  "originAddress": {
    "address": "Zona 10, Ciudad de Guatemala",
    "latitude": 14.621,
    "longitude": -90.526
  },
  "destinationAddress": {
    "address": "Zona 1, Ciudad de Guatemala",
    "latitude": 14.62,
    "longitude": -90.547
  }
}
```

Respuesta esperada:
- `total`
- `currency`
- `estimatedDeliveryTime`
- `breakdown`
- `packageDetails`
- `originAddress`
- `destinationAddress`

---

#### 2. Crear un paquete

- URL: `POST /api/packages`
- Body:
  - `idShipment`: ID del envío existente al que pertenece el paquete
  - `description`: descripción del paquete
  - `size`: tamaño o dimensión
  - `weight`: peso en kg
  - `subtotal`: costo calculado del paquete
  - `status`: opcional (true/false)

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/packages`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "idShipment": 10,
  "description": "Caja con documentos",
  "size": "30x20x10 cm",
  "weight": 2.2,
  "subtotal": 150.0
}
```

---

#### 3. Actualizar un paquete

- URL: `PUT /api/packages/:id`
- Body: cualquiera de los campos del paquete

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/packages/5`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "weight": 2.5,
  "subtotal": 165.0
}
```

---

#### 4. Eliminar un paquete

- URL: `DELETE /api/packages/:id`

Ejemplo (Postman):
- Método: DELETE
- URL: `https://pedidos-now-backend.onrender.com/api/packages/5`

---

#### 5. Cancelar un paquete

- URL: `POST /api/packages/:id/cancel`
- Header: `x-customer-token: <senderId>`

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/packages/5/cancel`
- Headers:
  - `x-customer-token: 1`
- Body: No body definido

Sólo el remitente puede cancelar un paquete y sólo cuando el envío está en estado `pending`.

---

#### 6. Obtener historial de seguimiento

- URL: `GET /api/packages/:id/tracking`

Ejemplo (Postman):
- Método: GET
- URL: `https://pedidos-now-backend.onrender.com/api/packages/5/tracking`

Respuesta:
- `packageId`
- `shipmentId`
- `currentStatus`
- `events` con `status`, `description`, `timestamp` y `location`

---

#### 7. Paquetes del cliente autenticado

- URL: `GET /api/packages/customers/me`
- Header: `x-customer-token: <cliente_id>` o query `?customerToken=<cliente_id>`

Ejemplo (Postman):
- Método: GET
- URL: `https://pedidos-now-backend.onrender.com/api/packages/customers/me`
- Headers:
  - `x-customer-token: 2`

---

### 📮 Envíos (Shipments)

#### 1. Crear un envío

- URL: `POST /api/shipments`
- Body:
  - `senderId`: ID del remitente
  - `receiverId`: ID del receptor
  - `deliveryInstructions`: instrucciones de entrega
  - `chargeType`: tipo de cobro (por ejemplo `prepaid` o `collect`)
  - `quoteData`: objeto o texto con datos de la cotización
  - `total`: valor total del envío

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/shipments`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "senderId": 1,
  "receiverId": 2,
  "deliveryInstructions": "Entregar en recepción",
  "chargeType": "prepaid",
  "quoteData": "Distancia corta, paquete ligero",
  "total": 200.0
}
```

El envío creado se inicia en estado `pending`.

---

#### 2. Confirmar envío por el receptor

- URL: `PATCH /api/shipments/:id/confirm`
- Header: `x-customer-token: <receiverId>`

Ejemplo (Postman):
- Método: PATCH
- URL: `https://pedidos-now-backend.onrender.com/api/shipments/8/confirm`
- Headers:
  - `x-customer-token: 2`
- Body: No body definido

Esto cambia el estado de `pending` a `receiver_accepted`.

---

#### 3. Aceptar y asignar repartidor

- URL: `PATCH /api/shipments/:id/accept`
- Body:
  - `courierId`: ID del repartidor que acepta el envío

Ejemplo (Postman):
- Método: PATCH
- URL: `https://pedidos-now-backend.onrender.com/api/shipments/8/accept`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "courierId": 3
}
```

Requiere que el envío ya esté en estado `receiver_accepted`.

---

#### 4. Actualizar estado del envío

- URL: `PATCH /api/shipments/:id/status`
- Body:
  - `status`: nuevo estado válido

Transiciones válidas:
- `receiver_accepted` → `assigned`
- `assigned` → `in_transit`
- `in_transit` → `delivered`

Ejemplo (Postman):
- Método: PATCH
- URL: `https://pedidos-now-backend.onrender.com/api/shipments/8/status`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "status": "in_transit"
}
```

---

#### 5. Eliminar un envío

- URL: `DELETE /api/shipments/:id`

Ejemplo (Postman):
- Método: DELETE
- URL: `https://pedidos-now-backend.onrender.com/api/shipments/8`

---

### 🚴 Repartidores (Couriers)

#### 1. Crear repartidor

- URL: `POST /api/couriers`
- Body:
  - `name`: nombre del repartidor
  - `status`: opcional, `true` o `false`

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/couriers`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Carlos López"
}
```

---

#### 2. Actualizar repartidor

- URL: `PUT /api/couriers/:id`
- Body: `name`, `status`, y/o campos de estado actuales.

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/couriers/3`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Carlos L.",
  "status": true
}
```

---

#### 3. Actualizar estado actual del repartidor

- URL: `PUT /api/couriers/:id/status`
- Body: `idStatus`, `id_status`, `statusName` o `status_name`

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/couriers/3/status`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "statusName": "En ruta"
}
```

También puedes usar `idStatus` si ya conoces el ID del tipo de estado.

---

#### 4. Ver repartidores disponibles

- URL: `GET /api/couriers/available`

Ejemplo (Postman):
- Método: GET
- URL: `https://pedidos-now-backend.onrender.com/api/couriers/available`

---

### 👤 Usuarios (Users)

#### 1. Crear usuario

- URL: `POST /api/users`
- Body:
  - `name`: nombre del usuario
  - `status`: opcional, `true` o `false`

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/users`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Ana Martínez"
}
```

---

#### 2. Actualizar usuario

- URL: `PUT /api/users/:id`
- Body: `name` y/o `status`

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/users/2`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Ana M.",
  "status": true
}
```

---

### 📍 Direcciones (Addresses)

#### 1. Crear dirección

- URL: `POST /api/addresses`
- Body:
  - `idUser`: ID del usuario propietario
  - `latitude`: latitud
  - `longitude`: longitud
  - `address`: dirección completa

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/addresses`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "idUser": 2,
  "latitude": 14.621,
  "longitude": -90.526,
  "address": "Zona 10, Ciudad de Guatemala"
}
```

---

#### 2. Actualizar dirección

- URL: `PUT /api/addresses/:id`
- Body: `idUser`, `latitude`, `longitude`, `address`

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/addresses/5`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "address": "Zona 11, Ciudad de Guatemala"
}
```

---

#### 3. Eliminar dirección

- URL: `DELETE /api/addresses/:id`

Ejemplo (Postman):
- Método: DELETE
- URL: `https://pedidos-now-backend.onrender.com/api/addresses/5`

---

### 💰 Precios (Prices)

#### 1. Crear tarifa

- URL: `POST /api/prices`
- Body:
  - `price`: valor numérico
  - `criteria`: criterio que describe la tarifa
  - `status`: opcional, `true` o `false`

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/prices`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "price": 45.0,
  "criteria": "Precio base por kg"
}
```

---

#### 2. Actualizar tarifa

- URL: `PUT /api/prices/:id`
- Body: `price`, `criteria` y/o `status`

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/prices/4`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "price": 49.0,
  "criteria": "Precio base por kg actualizado"
}
```

---

#### 3. Eliminar tarifa

- URL: `DELETE /api/prices/:id`

Ejemplo (Postman):
- Método: DELETE
- URL: `https://pedidos-now-backend.onrender.com/api/prices/4`

---

### 🏷️ Tipos de estado de repartidor (Courier Status Types)

#### 1. Crear tipo de estado

- URL: `POST /api/courier-status-types`
- Body:
  - `name`: nombre del estado
  - `description`: descripción del estado

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/courier-status-types`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "En ruta",
  "description": "El repartidor está en camino hacia la entrega"
}
```

---

#### 2. Actualizar tipo de estado

- URL: `PUT /api/courier-status-types/:id`
- Body: `name` y/o `description`

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/courier-status-types/2`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "description": "El repartidor está en ruta hacia el cliente"
}
```

---

#### 3. Eliminar tipo de estado

- URL: `DELETE /api/courier-status-types/:id`

Ejemplo (Postman):
- Método: DELETE
- URL: `https://pedidos-now-backend.onrender.com/api/courier-status-types/2`

---

### 📊 Estados de repartidor (Courier Statuses)

#### 1. Crear estado de repartidor

- URL: `POST /api/courier-statuses`
- Body:
  - `idCourier`: ID del repartidor
  - `idStatus`: ID del tipo de estado

Ejemplo (Postman):
- Método: POST
- URL: `https://pedidos-now-backend.onrender.com/api/courier-statuses`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "idCourier": 3,
  "idStatus": 2
}
```

---

#### 2. Actualizar estado de repartidor

- URL: `PUT /api/courier-statuses/:id`
- Body: `idCourier` y/o `idStatus`

Ejemplo (Postman):
- Método: PUT
- URL: `https://pedidos-now-backend.onrender.com/api/courier-statuses/1`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "idStatus": 3
}
```

---

#### 3. Eliminar estado de repartidor

- URL: `DELETE /api/courier-statuses/:id`

Ejemplo (Postman):
- Método: DELETE
- URL: `https://pedidos-now-backend.onrender.com/api/courier-statuses/1`

---

## Uso rápido

- Ver todos los paquetes: `GET https://pedidos-now-backend.onrender.com/api/packages`
- Ver todos los envíos: `GET https://pedidos-now-backend.onrender.com/api/shipments`
- Ver repartidores disponibles: `GET https://pedidos-now-backend.onrender.com/api/couriers/available`

Si necesitas que agregue un ejemplo para un campo específico o la respuesta completa de cada endpoint, lo añado en la siguiente versión.
