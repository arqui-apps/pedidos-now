# Gestión de Estados de Repartidores - Módulo Paquetería

## Descripción

Este módulo gestiona los cambios de estado de los repartidores en la aplicación de paquetería. Los estados son:

- **Disponible**: Repartidor en línea y puede tomar pedidos
- **Ocupado**: Repartidor tiene un pedido en curso
- **Desconectado**: Repartidor no está en la aplicación
- **Inactivo**: Repartidor ya no trabaja en la aplicación (borrado lógico)

---

## Transiciones de Estado Permitidas

```
Disponible   ←→ Desconectado
    ↓
  Ocupado ↔ Disponible
    
Inactivo (sin transiciones salientes)
```

**Tabla de transiciones:**

| De Estado | A Estados Permitidos |
|-----------|----------------------|
| Disponible | Desconectado, Ocupado |
| Ocupado | Disponible |
| Desconectado | Disponible |
| Inactivo | (ninguno) |

---

## Estructura de Base de Datos

### Tabla: `courier_status_type` (Tipos de Estado)
```sql
CREATE TABLE courier_status_type (
    id_status INT PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    description VARCHAR(255),
    created_at DATETIME
);
```

### Tabla: `courier_status` (Estado Actual)
```sql
CREATE TABLE courier_status (
    id_courier_status INT PRIMARY KEY,
    id_courier INT UNIQUE,  -- FK a courier(id_courier)
    id_status INT,          -- FK a courier_status_type(id_status)
    changed_at DATETIME,
    updated_at DATETIME
);
```

---

## Endpoints API

### 1. Obtener Estado Actual del Repartidor
```
GET /api/courier-status/:courierId
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "idCourierStatus": 1,
    "idCourier": 101,
    "CourierStatusType": {
      "idStatus": 1,
      "name": "Disponible",
      "description": "Repartidor en línea y puede tomar pedidos"
    },
    "changedAt": "2026-03-15T10:30:00.000Z",
    "updatedAt": "2026-03-15T10:30:00.000Z"
  }
}
```

### 2. Cambiar Estado del Repartidor
```
POST /api/courier-status/:courierId/change
```
**Body:**
```json
{
  "newStatusName": "Ocupado",
  "reason": "Pedido asignado #12345"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Estado actualizado correctamente",
  "data": { /* ... */ },
  "metadata": {
    "previousStatus": "Disponible",
    "newStatus": "Ocupado",
    "reason": "Pedido asignado #12345"
  }
}
```

### 3. Obtener Transiciones Válidas
```
GET /api/courier-status/:courierId/valid-transitions
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "currentStatus": "Disponible",
    "validTransitions": ["Desconectado", "Ocupado"]
  }
}
```

### 4. Obtener Todos los Tipos de Estado
```
GET /api/courier-status-types
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "idStatus": 1,
      "name": "Disponible",
      "description": "Repartidor en línea y puede tomar pedidos"
    },
    /* ... más estados ... */
  ]
}
```

### 5. Inicializar Estado de Nuevo Repartidor (Interno)
```
POST /api/courier-status/initialize
```
**Body:**
```json
{
  "courierId": 102,
  "initialStatus": "Disponible"
}
```

---

## Lógica de Cambios de Estado

Las reglas de negocio son:

1. **Disponible → Ocupado**: Un repartidor "Disponible" toma una entrega
   - *Quién lo inicia:* Sistema (cuando se asigna un pedido)

2. **Ocupado → Disponible**: Un repartidor termina una entrega
   - *Quién lo inicia:* Repartidor o Sistema (cuando se marca como entregado)

3. **Disponible ↔ Desconectado**: Repartidor se conecta/desconecta manualmente
   - *Quién lo inicia:* Repartidor (en la app)

4. **Cualquier estado → Inactivo**: Repartidor deja de trabajar
   - *Quién lo inicia:* Administración o Broker

---

## Instalación y Configuración

### 1. Crear las tablas en la BD
```bash
# Ejecutar el SQL actualizado
mysql -u usuario -p paqueteria_db < paqueteria_db.sql
```

### 2. Instalar dependencias (si falta)
```bash
npm install
```

### 3. Ejecutar el seeder para inicializar estados
```bash
node seeders/init-courier-status.js
```

### 4. Iniciar el servidor
```bash
npm run dev    # En desarrollo
npm start      # En producción
```

---

## Uso en Código

### Ejemplo: Cambiar estado cuando se asigna un pedido
```javascript
// En el controlador de shipment
const utils = require('axios'); // o tu cliente HTTP

const assignShipmentToCourier = async (shipmentId, courierId) => {
  try {
    // 1. Asignar el pedido
    const shipment = await Shipment.update(
      { courier_id: courierId, shipment_status: 'assigned' },
      { where: { id_shipment: shipmentId } }
    );

    // 2. Cambiar estado del repartidor a "Ocupado"
    const response = await axios.post(
      `http://localhost:3000/api/courier-status/${courierId}/change`,
      { newStatusName: 'Ocupado', reason: `Pedido ${shipmentId} asignado` }
    );

    return response.data;
  } catch (error) {
    console.error('Error asignando pedido:', error);
    throw error;
  }
};
```

---

## Integración con Broker (PRÓXIMO PASO)

Cuando sepan qué broker usar (RabbitMQ, Kafka, Redis, etc.), se deberá:

1. Crear archivo: `src/services/broker.service.js`
2. Publicar evento cuando cambia el estado:
   ```javascript
   // En courier_status.controller.js, después de actualizar
   brokerService.publishCourierStatusChange({
     courierId,
     previousStatus: currentStatusName,
     newStatus: newStatusName,
     timestamp: new Date()
   });
   ```

3. Escuchar eventos del broker para actualizar estados desde administración:
   ```javascript
   // En server.js o un archivo dedicated
   brokerService.subscribeToAdminUpdates((message) => {
     // Actualizar estado del repartidor
   });
   ```

---

## Estructura de Archivos Creados

```
src/
├── models/
│   ├── courier_status_type.js      (Modelo de tipos de estado)
│   ├── courier_status.js           (Modelo de estado actual)
│   └── init-models.js              (Actualizado con nuevas relaciones)
├── controllers/
│   └── courier_status.controller.js (Lógica de cambios)
├── routes/
│   └── courier_status.routes.js    (Endpoints)
└── app.js                          (Actualizado con rutas)

seeders/
└── init-courier-status.js          (Inicializar datos)

paqueteria_db.sql                   (Actualizado con nuevas tablas)
```

---

## Próximos Pasos

- [ ] Verificar con el grupo qué broker usan
- [ ] Crear integración con el broker
- [ ] Agregar autenticación a los endpoints (si es necesario)
- [ ] Agregar logs/auditoría de cambios de estado
- [ ] Crear tests automatizados
- [ ] Documentación de eventos del broker

---

## Notas

- El estado inicial de un repartidor es "Disponible"
- La transición de estado debe ser validada en TODAS las operaciones
- Los cambios de estado deben ser publicados en el broker para sincronización
- Se recomienda agregar logs para seguimiento y auditoria
