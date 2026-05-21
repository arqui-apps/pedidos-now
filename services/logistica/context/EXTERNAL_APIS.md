# APIs Externas — Contratos de Integración

Este documento describe las APIs de otros microservicios que este módulo consume.

---

## 🔐 Servicio de Autenticación

**Base URL**: `http://localhost:3001`

### POST `/api/auth/validate`
Validar un token JWT

**Headers**:
```
Authorization: Bearer <token>
```

**Response exitoso**:
```json
{
  "id": 123,
  "username": "usuario",
  "email": "usuario@example.com",
  "role": "cliente"
}
```

**Response error**:
```json
{
  "error": "Token inválido o expirado"
}
```

---

## 📡 Servicio Broker

**Base URL**: `http://localhost:3002`

### POST `/api/pedidos/notify`
Notificar al Broker sobre un nuevo pedido para asignación de repartidor

**Body**:
```json
{
  "pedidoId": 456,
  "restauranteId": 1,
  "clienteId": 123
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pedido notificado correctamente"
}
```

---

## 🎟️ Servicio de Descuentos

**Base URL**: `http://localhost:3003`

### GET `/api/promociones`
Obtener promociones disponibles

**Query params**:
- `restauranteId`: ID del restaurante
- Otros filtros opcionales

**Response**:
```json
[
  {
    "id": 1,
    "codigo": "PROMO10",
    "descripcion": "10% de descuento",
    "tipo": "porcentaje",
    "valor": 10
  }
]
```

### POST `/api/descuentos/validate`
Validar un código de descuento

**Body**:
```json
{
  "codigo": "PROMO10",
  "pedido": {
    "restauranteId": 1,
    "productos": [...],
    "subtotal": 100
  }
}
```

**Response exitoso**:
```json
{
  "valido": true,
  "descuento": 10,
  "mensaje": "Descuento aplicado"
}
```

**Response error**:
```json
{
  "valido": false,
  "mensaje": "Código expirado"
}
```

---

## 💳 Servicio de Cobros

**Base URL**: `http://localhost:3004`

### POST `/api/multas`
Aplicar una multa a un cliente

**Body**:
```json
{
  "clienteId": 123,
  "pedidoId": 456,
  "monto": 15.50,
  "motivo": "Cancelación de pedido"
}
```

**Response**:
```json
{
  "success": true,
  "multaId": 789,
  "monto": 15.50
}
```

### POST `/api/cobros`
Procesar un cobro

**Body**:
```json
{
  "clienteId": 123,
  "monto": 50.00,
  "concepto": "Pago de pedido",
  "metodoPago": "tarjeta"
}
```

**Response**:
```json
{
  "success": true,
  "transaccionId": "TXN-12345",
  "estado": "aprobado"
}
```

---

## ⚠️ Manejo de Errores

Todos los servicios externos deben manejarse con try-catch y logging apropiado. Si un servicio externo falla, la aplicación debe continuar funcionando con funcionalidad degradada cuando sea posible.

**Ejemplo**:
```javascript
try {
  await brokerService.notifyNuevoPedido(data);
} catch (error) {
  console.error('Error al notificar al Broker:', error.message);
  // Continuar - el pedido se creó correctamente
}
```
