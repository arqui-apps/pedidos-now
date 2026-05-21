# Módulo de Logística — Documento de Contexto e Integración

> **Propósito de este documento:** Poner en contexto a cualquier IA o desarrollador sobre la arquitectura del módulo de logística, los cambios aplicados a la base de datos, la lógica de integración con el módulo de Negocios y Restaurantes, y los requerimientos de la UI de Repartidores. Leer de principio a fin antes de generar código o endpoints relacionados.

---

## 1. Visión general del módulo

El **Módulo de Logística** es el broker central que conecta tres actores:

| Actor | Rol |
|---|---|
| **Negocios / Restaurantes** | Originan los pedidos. Envían datos al módulo de logística para crear entregas. |
| **UI Repartidores** | Consume el feed de pedidos disponibles, acepta entregas y avanza su estado. |
| **Administración** | Supervisa, reasigna, resuelve incidencias y gestiona catálogos (como tipos de negocio). |

El módulo **no es un simple proxy**. Persiste todos los datos relevantes del pedido en su propia base de datos en el momento de creación de la entrega. Esto lo hace operativamente independiente — si el módulo de negocios cae, las entregas en curso no se ven afectadas.

### Flujo principal de una entrega

```
Negocio crea pedido
       │
       ▼
Logística verifica negocio activo
       │
       ▼
Logística obtiene payload completo del pedido (GET /api/orders/{id}/logistics-payload)
       │
       ▼
Logística crea registro en tabla `entregas` (estado: pendiente)
       │
       ▼
WebSocket emite NEW_ORDERS_BATCH al feed de repartidores
       │
       ▼
Repartidor acepta → estado: asignada → se detiene cancelación automática
       │
       ▼
Negocio marca pedido listo → WebSocket emite READY_FOR_PICKUP al repartidor
       │
       ▼
Repartidor recoge → estado: en_ruta
       │
       ▼
Repartidor entrega → estado: entregada → se notifica a negocios → se acredita tarifa
```

---

## 2. Base de datos — Versión 3.0 (PostgreSQL)

### 2.1 Resumen de tablas

| Tabla | Descripción |
|---|---|
| `categorias_orden` | Tipos de negocio/pedido. Gestionados por admin. **Nueva en v3.0.** |
| `repartidores` | Perfil logístico del repartidor (estado, ubicación GPS, métricas). |
| `entregas` | Registro principal. Persiste todos los datos del pedido de forma independiente. |
| `asignaciones_entrega` | Qué repartidor atiende qué entrega. Soporta historial de reasignaciones. |
| `historial_estados_entrega` | Auditoría inmutable de cada cambio de estado. Solo INSERT, nunca UPDATE. |
| `incidencias_entrega` | Problemas reportados por el repartidor durante la entrega. |
| `historial_ubicaciones_repartidor` | Posiciones GPS emitidas por WebSocket. Para rastreo y auditoría. |
| `notificaciones_logistica` | Log de notificaciones enviadas al módulo de negocios. Permite reintentos. |
| `calificaciones_entrega` | Calificación del repartidor al completar. Una por entrega. |

### 2.2 Diagrama de relaciones clave

```
categorias_orden
       │ id_categoria
       │ (FK)
       ▼
   entregas ◄──────────── asignaciones_entrega ────► repartidores
       │                                                    │
       │ (FK)                                               │ (FK)
       ▼                                                    ▼
historial_estados_entrega                    historial_ubicaciones_repartidor
       │
       ├──► incidencias_entrega
       ├──► notificaciones_logistica
       └──► calificaciones_entrega
```

---

## 3. Cambio crítico en v3.0 — Categorías dinámicas

### 3.1 Problema con el diseño anterior

En la versión anterior (v2.0), el tipo de negocio estaba definido como un `ENUM` de PostgreSQL:

```sql
-- VERSIÓN ANTERIOR — ya no existe
CREATE TYPE categoria_orden_enum AS ENUM (
    'FOOD',
    'MARKET',
    'PHARMACY',
    'PACKAGE'
);
```

**Por qué era un problema:** Agregar un nuevo tipo de negocio (por ejemplo `PET_SHOP`, `LAUNDRY`, `GAS_STATION`) requería un `ALTER TYPE` en producción, que hace lock a la tabla `entregas` y puede requerir reinicio de conexiones. Tampoco era posible eliminar valores del ENUM sin reconstruir el tipo. Administración no podía gestionar esto desde un panel — requería intervención técnica directa en la base de datos.

### 3.2 Solución aplicada — Tabla `categorias_orden`

Se eliminó el ENUM y se creó una tabla independiente:

```sql
CREATE TABLE categorias_orden (
    id_categoria        SMALLSERIAL     NOT NULL,
    codigo              VARCHAR(50)     NOT NULL,   -- Clave técnica: 'FOOD', 'PET_SHOP'
    nombre              VARCHAR(100)    NOT NULL,   -- Etiqueta visible: 'Comida', 'Mascotas'
    descripcion         TEXT            NULL,
    icono               VARCHAR(100)    NULL,       -- Nombre del ícono en el sistema de diseño
    color_hex           VARCHAR(7)      NULL,       -- Ej: '#FF6B35' — validado con CHECK
    orden_display       SMALLINT        NOT NULL DEFAULT 0,
    activa              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categorias_orden  PRIMARY KEY (id_categoria),
    CONSTRAINT uq_categorias_codigo UNIQUE (codigo),
    CONSTRAINT chk_color_hex        CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);
```

**Datos iniciales cargados automáticamente** (las 4 categorías originales del sistema):

```sql
INSERT INTO categorias_orden (codigo, nombre, descripcion, icono, color_hex, orden_display) VALUES
    ('FOOD',     'Comida',        'Restaurantes y comida rápida',         'utensils',      '#FF6B35', 1),
    ('MARKET',   'Supermercado',  'Abarrotes y productos del hogar',      'shopping-cart', '#4CAF50', 2),
    ('PHARMACY', 'Farmacia',      'Medicamentos y productos de salud',    'pill',          '#2196F3', 3),
    ('PACKAGE',  'Paquetería',    'Envíos y mandados en general',         'package',       '#9C27B0', 4);
```

### 3.3 Cambio en la tabla `entregas`

```sql
-- ANTES
categoria_orden   categoria_orden_enum   NOT NULL

-- AHORA
categoria_id      SMALLINT               NOT NULL
-- Con FK: REFERENCES categorias_orden(id_categoria)
```

### 3.4 Cómo agregar un nuevo tipo de negocio desde admin

Sin tocar código ni schema. Solo un INSERT:

```sql
INSERT INTO categorias_orden (codigo, nombre, icono, color_hex, orden_display)
VALUES ('PET_SHOP', 'Mascotas', 'paw', '#FF9800', 5);
```

Para desactivarlo (desaparece del feed sin borrar histórico):

```sql
UPDATE categorias_orden SET activa = FALSE WHERE codigo = 'PET_SHOP';
```

---

## 4. Columnas nuevas en `entregas` (respecto a versión MySQL original)

Estas columnas se agregaron porque la UI de Repartidores las requiere explícitamente según el contrato de interfaces TypeScript definido en los requerimientos.

| Columna | Tipo | Por qué existe |
|---|---|---|
| `categoria_id` | `SMALLINT FK` | Reemplaza el ENUM. Determina ícono y etiqueta en `FeedOrderCard`. |
| `metodo_pago` | `metodo_pago_enum` | Visible en la tarjeta del feed (`CASH` o `CARD`). |
| `tarifa_ofrecida` | `DECIMAL(10,2)` | Lo que gana el repartidor. Campo `offeredTariff` en `FeedOrderCard`. |
| `distancia_estimada_km` | `DECIMAL(6,2)` | Recorrido aproximado. Campo `estimatedDistanceKm` en el feed. |
| `negocio_nombre` | `VARCHAR(255)` | Nombre del negocio remitente. Campo `businessOrSenderName` en el feed. |
| `negocio_telefono` | `VARCHAR(20)` | Solo visible en panel de pedido activo (post-accept). |
| `negocio_direccion` | `TEXT` | Dirección del punto de recogida. |
| `origen_lat / origen_lng` | `DECIMAL(10,7)` | Coordenadas del negocio para el mapa de previsualización. |
| `cliente_nombre` | `VARCHAR(255)` | Nombre del destinatario. Solo en panel activo. |
| `cliente_telefono` | `VARCHAR(20)` | Solo visible post-accept por seguridad. |
| `referencia_direccion` | `VARCHAR(255)` | Referencia del destino (ej: "Portón azul frente al parque"). |
| `instrucciones_entrega` | `TEXT` | Instrucciones especiales del cliente. |
| `destino_lat / destino_lng` | `DECIMAL(10,7)` | Coordenadas del destino para el mapa. |
| `detalles_orden` | `JSONB` | Lista de productos o descripción del paquete. Ej: `["1x Analgésico", "2x Suero"]`. |
| `cancelacion_auto_at` | `TIMESTAMPTZ` | Timestamp límite para la regla de cancelación automática de 5 minutos. |
| `motivo_cancelacion` | `motivo_cancelacion_enum` | Razón de cancelación para auditoría y reportes. |

### Por qué los datos del negocio y cliente se persisten en `entregas`

Esta es una decisión arquitectónica deliberada. Los datos del negocio (nombre, teléfono, dirección, coordenadas) y del cliente se copian al momento de crear la entrega y se guardan en la tabla `entregas`.

**Razones:**
1. **Independencia operativa:** Si el módulo de negocios cae o el pedido es modificado/cancelado en ese sistema, la entrega en curso no pierde sus datos.
2. **Seguridad:** Los datos sensibles (teléfonos, direcciones exactas) no viajan en el feed público — solo están disponibles una vez que el repartidor acepta el pedido, vía `GET /api/orders/{id}/active-details`.
3. **Rendimiento:** El repartidor no genera una llamada al módulo de negocios cada vez que abre el panel de pedido activo.

---

## 5. Tablas nuevas (no existían en la versión MySQL original)

### `repartidores`
Perfil logístico del repartidor. **Los datos de usuario (nombre, email, contraseña) viven en el módulo de autenticación/usuarios** — aquí solo se guarda lo que logística necesita: estado operativo, última posición GPS, estado del WebSocket de ubicación, y métricas acumuladas (total de entregas, calificación promedio).

El campo `estado` controla la visibilidad en el feed:
- `disponible` → aparece en el feed, recibe pedidos
- `ocupado` → con pedido activo, no recibe más
- `inactivo` → desconectado o fuera de turno

### `historial_ubicaciones_repartidor`
Cada frame emitido por el WebSocket de ubicación (`WSS /ws/couriers/me/location`) se persiste aquí. Permite rastreo en tiempo real, auditoría de recorridos y cálculo de distancias reales recorridas. El campo `entrega_id` es `NULL` cuando el repartidor está disponible sin pedido activo, y se asocia a una entrega cuando está en ruta.

### `notificaciones_logistica`
Loggea cada llamada que logística hace al módulo de negocios (`PATCH /api/orders/{id}/logistics-status`). Registra el payload enviado, el HTTP status recibido, y el número de intentos. Esto permite implementar reintentos automáticos (circuit breaker) y alertas cuando una notificación falla repetidamente.

### `calificaciones_entrega`
Una calificación por entrega completada. Es disparada por el módulo de negocios cuando recibe la notificación `DELIVERED` y el cliente emite su calificación. Un trigger en PostgreSQL actualiza automáticamente el campo `calificacion_promedio` en la tabla `repartidores`.

---

## 6. Integración con Negocios y Restaurantes

### 6.1 Lo que logística consume de negocios (llamadas salientes)

| Endpoint | Cuándo se llama | Para qué |
|---|---|---|
| `GET /api/businesses/{id}/branches/{id}/status` | Al iniciar creación de entrega | Verificar que el negocio y sucursal estén activos antes de proceder |
| `GET /api/orders/{id}/logistics-payload` | Una sola vez, al crear la entrega | Obtener todos los datos del pedido y persistirlos en `entregas` |
| `GET /api/logistics/couriers/available?lat&lng&radio_km` | Al crear la entrega | Verificar disponibilidad de repartidores en zona (interno de logística) |

### 6.2 Lo que logística expone a negocios (llamadas entrantes)

| Endpoint | Disparado por | Para qué |
|---|---|---|
| `PATCH /api/orders/{id}/logistics-status` | Logística → Negocios | Notificar cambios de estado: `ACCEPTED`, `PICKED_UP`, `DELIVERED`, `CANCELLED` |

### 6.3 WebSockets

| Canal | Dirección | Descripción |
|---|---|---|
| `WSS /ws/orders/available` | Server → Repartidor | Feed de pedidos disponibles. Evento `NEW_ORDERS_BATCH` al crear entrega. Evento `ORDER_REMOVED` al ser aceptada por otro. |
| `WSS /ws/orders/{id}/live-updates` | Negocio → Server → Repartidor | El negocio empuja `READY_FOR_PICKUP` cuando el pedido está listo. Habilita el botón "Orden recogida" en la UI. |
| `WSS /ws/couriers/me/location` | Repartidor → Server | El repartidor emite su GPS continuamente. El servidor persiste en `historial_ubicaciones_repartidor` y actualiza `ultima_lat/lng` en `repartidores`. |

### 6.4 Payload que negocios debe enviar a logística

Cuando logística llama `GET /api/orders/{id}/logistics-payload`, negocios debe responder con esta estructura completa:

```json
{
  "orden_id": "ORD-8899",
  "tipo_origen": "pedido",
  "empresa_id": 1,
  "sucursal_id": 1,
  "cliente_id": 500,

  "categoria_codigo": "PHARMACY",
  "metodo_pago": "CASH",
  "tarifa_ofrecida": 25.00,
  "monto_cobrar": 150.00,
  "distancia_estimada_km": 4.2,

  "negocio_nombre": "Farmacia Galeno",
  "negocio_telefono": "7776-5544",
  "negocio_direccion": "Zona 3, Quetzaltenango",
  "origen_coordenadas": { "lat": 14.8355, "lng": -91.5275 },

  "cliente_nombre": "María López",
  "cliente_telefono": "4433-2211",
  "direccion_entrega": "Zona 1, Quetzaltenango",
  "referencia_direccion": "Portón azul frente al parque",
  "instrucciones_entrega": "Llamar al llegar",
  "destino_coordenadas": { "lat": 14.8400, "lng": -91.5200 },

  "detalles_orden": [
    "1x Analgésico 500mg",
    "2x Suero Rehidratante"
  ],

  "fecha_entrega_estimada": "2026-03-31T15:30:00Z"
}
```

**Nota sobre `categoria_codigo`:** Negocios envía el código como string (ej: `"PHARMACY"`). Logística hace el lookup en `categorias_orden` por `codigo` para obtener el `id_categoria` que guarda en `entregas`. Si el código no existe o la categoría está inactiva, la creación de entrega es rechazada con `422`.

---

## 7. Seguridad por capas en los datos del pedido

La UI de Repartidores tiene tres niveles de acceso a los datos de un pedido, diseñados para proteger la privacidad del cliente:

### Nivel 1 — Feed público (antes de aceptar)
Solo datos mínimos visibles en `FeedOrderCard`. Sin información de contacto ni direcciones exactas.

```
orderId, totalOrderAmount, offeredTariff, paymentMethod,
estimatedDistanceKm, businessOrSenderName, category
```

### Nivel 2 — Preview (popup "Ver detalles", antes de aceptar)
Agrega nombres y direcciones generales, más mapa de previsualización. Sin teléfonos.

```
+ businessOrSenderName, businessOrSenderAddress
+ clientOrReceiverName, clientOrReceiverAddress
+ originCoordinates, destinationCoordinates
```

### Nivel 3 — Panel de pedido activo (post-accept)
Todos los datos incluyendo teléfonos, referencias, instrucciones y lista de productos.

```
+ businessOrSenderPhone, clientOrReceiverPhone
+ referencia_direccion, instrucciones_entrega
+ orderDetails (lista de productos)
+ currentStatus
```

---

## 8. Reglas de negocio críticas

### Cancelación automática de 5 minutos
Al crear una entrega, el backend calcula `cancelacion_auto_at = NOW() + 5 minutos`. Un job scheduler (cron o queue worker) revisa periódicamente la vista `v_entregas_pendientes_feed` y cancela las entregas donde `cancelacion_auto_at < NOW()`. Al cancelar, emite `ORDER_REMOVED` al feed y notifica al módulo de negocios con `logistics_status: CANCELLED`.

**La regla se detiene** en el momento en que un repartidor llama `PATCH /api/orders/{id}/accept` exitosamente — el backend debe limpiar el job o marcar `cancelacion_auto_at = NULL`.

### Una sola asignación activa por entrega
La tabla `asignaciones_entrega` usa una restricción `EXCLUDE USING btree` que garantiza a nivel de base de datos que solo puede existir una fila con `activa = TRUE` por `entrega_id`. Esto previene race conditions cuando dos repartidores aceptan el mismo pedido simultáneamente — el segundo recibirá un `409 Conflict`.

### Transiciones de estado válidas
```
pendiente → asignada     (repartidor acepta)
asignada  → en_ruta      (repartidor marca PICKED_UP)
en_ruta   → entregada    (repartidor marca DELIVERED)
pendiente → cancelada    (cancelación automática o manual)
asignada  → cancelada    (cancelación manual por admin)
cualquiera → fallida     (incidencia no resuelta)
```

Cualquier transición fuera de este flujo debe ser rechazada con `422 Unprocessable Entity`.

### Estado del repartidor
- Al aceptar un pedido: `estado → ocupado`
- Al marcar `DELIVERED` o `CANCELLED`: `estado → disponible`
- Al desconectarse del WebSocket de ubicación: `ws_estado → desconectado`

---

## 9. Vistas disponibles en la base de datos

### `v_entregas_pendientes_feed`
Pedidos pendientes de asignación con tiempo restante antes de cancelación automática. Incluye todos los campos de `categorias_orden` (código, nombre, ícono, color) via JOIN. Usada por el job scheduler y por el endpoint que sirve el feed inicial al repartidor cuando se conecta.

### `v_entregas_activas`
Entregas en curso (`asignada` o `en_ruta`) con los datos del repartidor asignado y su última ubicación GPS conocida. Incluye datos completos de la categoría. Usada por el panel de administración para monitoreo en tiempo real.

### `v_repartidores_disponibles`
Repartidores con `estado = 'disponible'` y `ws_estado = 'conectado'`. Incluye segundos transcurridos desde la última ubicación emitida. Usada para verificar disponibilidad en zona antes de crear una entrega.

---

## 10. Triggers automáticos

| Trigger | Tabla | Qué hace |
|---|---|---|
| `trg_entregas_updated_at` | `entregas` | Actualiza `updated_at` en cada UPDATE |
| `trg_categorias_updated_at` | `categorias_orden` | Actualiza `updated_at` en cada UPDATE |
| `trg_repartidores_updated_at` | `repartidores` | Actualiza `updated_at` en cada UPDATE |
| `trg_incidencias_updated_at` | `incidencias_entrega` | Actualiza `updated_at` en cada UPDATE |
| `trg_calificacion_promedio` | `calificaciones_entrega` | Recalcula `calificacion_promedio` en `repartidores` al insertar/actualizar una calificación |
| `trg_metricas_repartidor` | `entregas` | Incrementa `total_entregas` al pasar a `entregada`. Incrementa `total_cancelaciones` si se cancela estando `asignada`. |

---

## 11. Archivos de referencia

| Archivo | Descripción |
|---|---|
| `logistica_schema.sql` | Schema completo de PostgreSQL v3.0 listo para ejecutar |
| `logistica_negocios_restaurantes.postman_collection.json` | Colección Postman con todos los endpoints, mocks de request/response y documentación inline |

---

## 12. Checklist para el equipo de Negocios y Restaurantes

Antes de conectar con el módulo de logística, el módulo de negocios debe tener implementados:

- [ ] `GET /api/businesses/{empresa_id}/branches/{sucursal_id}/status` — con campos `is_active`, `accepts_orders`, `origin_coordinates`
- [ ] `GET /api/orders/{orden_id}/logistics-payload` — con el payload completo descrito en la sección 6.4
- [ ] `PATCH /api/orders/{orden_id}/logistics-status` — para recibir notificaciones de logística
- [ ] WebSocket capaz de emitir evento `BUSINESS_STATUS_UPDATE` con `newStatus: "READY_FOR_PICKUP"` cuando el pedido esté preparado
- [ ] El campo `categoria_codigo` en su respuesta debe usar exactamente los códigos definidos en `categorias_orden.codigo` (case-sensitive: `FOOD`, `MARKET`, `PHARMACY`, `PACKAGE`)
- [ ] Coordenadas en formato `{ lat: DECIMAL, lng: DECIMAL }` con precisión mínima de 4 decimales