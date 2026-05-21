# ENUNCIADO: MÓDULO DE LOGÍSTICA

## 🎯 OBJETIVO DEL MÓDULO

Desarrollar el **Módulo de Logística** como una capa centralizada y especializada para gestionar la operación de entregas generadas por los módulos de **Restaurante** y **Negocios**, evitando duplicidad de lógica y centralizando la asignación de repartidores, el control de estados, el historial de cambios y el registro de incidencias operativas.

---

## 📋 CONTEXTO Y JUSTIFICACIÓN

### ¿Por qué este módulo?

Actualmente, tanto **Restaurante** como **Negocios** requieren funcionalidad de entregas para completar sus operaciones comerciales. Sin un módulo centralizado, cada uno tendría que:

- Implementar su propia lógica de asignación de repartidores
- Duplicar la gestión de estados de entrega
- Mantener registros separados de historial e incidencias
- Gestionar independientemente la comunicación con repartidores

Esto genera:
- ❌ Duplicidad de código y mantenimiento
- ❌ Inconsistencias en la operación
- ❌ Dificultad para escalar
- ❌ Riesgo de conflictos en asignaciones de repartidores

### Solución propuesta

✅ **Logística** como módulo especializado que:
- Centraliza toda la operación de entregas comerciales
- Consume información maestra de repartidores desde **Administración**
- Se mantiene independiente de **Paquetería** (que tiene su propia lógica)
- Ofrece una interfaz consistente para **Restaurante** y **Negocios**

---

## 🏗️ RESPONSABILIDADES DEL MÓDULO

### ✅ QUÉ HARÁ

1. **Gestión de Entregas**
   - Recibir solicitudes de entrega desde Restaurante y Negocios
   - Registrar cada entrega como operación independiente
   - Mantener información de origen, destino, cliente y referencias

2. **Asignación de Repartidores**
   - Asignar repartidores disponibles a entregas pendientes
   - Validar disponibilidad del repartidor con Administración
   - Actualizar estado operativo del repartidor tras asignación

3. **Control de Estados**
   - Gestionar el ciclo de vida de cada entrega
   - Estados soportados:
     - `pendiente`: Entrega registrada, sin asignar
     - `asignada`: Repartidor asignado
     - `en_preparacion`: Pedido siendo preparado
     - `lista_para_recoger`: Lista para que el repartidor recoja
     - `en_camino`: Repartidor en ruta hacia el cliente
     - `entregada`: Entrega completada exitosamente
     - `cancelada`: Entrega cancelada
     - `fallida`: Entrega no completada

4. **Historial de Cambios**
   - Registrar cada cambio de estado con timestamp
   - Mantener trazabilidad completa del flujo
   - Registrar usuario/sistema que realizó el cambio

5. **Gestión de Incidencias**
   - Registrar problemas durante la entrega
   - Tipos de incidencias:
     - Cliente no responde
     - Dirección incorrecta
     - Problema en comercio
     - Pedido dañado
     - Cancelación del cliente
     - Otros (con descripción libre)

6. **Consultas y Reportes**
   - Proveer endpoints para consultar estado de entregas
   - Permitir a Restaurante/Negocios rastrear sus entregas
   - Generar métricas básicas de operación

### ❌ QUÉ NO HARÁ

1. **NO gestionará catálogos comerciales** (productos, menús, inventarios)
2. **NO administrará carritos de compra**
3. **NO procesará pagos** del pedido original
4. **NO creará pedidos** de restaurante o negocios
5. **NO administrará la lógica de Paquetería** (módulo independiente)
6. **NO registrará maestros de repartidores** (responsabilidad de Administración)
7. **NO gestionará usuarios administrativos generales**
8. **NO implementará** (en esta fase):
   - Gestión de vehículos
   - Rutas avanzadas con optimización
   - Geolocalización en tiempo real
   - Liquidaciones de repartidor
   - Evidencias multimedia (fotos de entrega)
   - Tarifas dinámicas
   - Turnos complejos

---

## 🔗 INTEGRACIONES Y DEPENDENCIAS

### Dependencias de Entrada (Módulos Origen)

#### 1. **Restaurante**
- **Qué recibe**: Solicitudes de entrega cuando un pedido requiere envío
- **Información requerida**:
  ```json
  {
    "modulo_origen": "restaurante",
    "referencia_origen": "pedido_id",
    "restaurante_id": 123,
    "cliente_id": 456,
    "direccion_entrega": "Calle 123",
    "ciudad": "Ciudad",
    "coordenadas": { "lat": 0.0, "lng": 0.0 },
    "monto_cobrar": 50.00,
    "notas": "Tocar timbre 2 veces"
  }
  ```
- **Comunicación**: API REST POST `/api/entregas`
- **Consultas**: GET `/api/entregas/restaurante/:pedidoId`

#### 2. **Negocios**
- **Qué recibe**: Igual que Restaurante pero con `modulo_origen: "negocios"`
- **Comunicación**: Misma API REST
- **Consultas**: GET `/api/entregas/negocios/:pedidoId`

### Dependencias de Salida (Consumo de Servicios)

#### 3. **Administración** (crítico)
- **Qué consume**:
  - Lista de repartidores disponibles
  - Validación de estado operativo del repartidor
  - Información básica del repartidor (nombre, contacto)
  
- **APIs esperadas**:
  ```
  GET /api/repartidores?disponible=true&modulo=logistica
  GET /api/repartidores/:id
  PATCH /api/repartidores/:id/estado
  ```

- **Actualización de estado**:
  Cuando Logística asigna un repartidor, debe notificar a Administración:
  ```json
  {
    "estado_operativo": "ocupado",
    "modulo_activo": "logistica",
    "entrega_id": 789
  }
  ```

### Relación con Paquetería

- **NO hay dependencia directa funcional**
- Ambos módulos **comparten** la fuente maestra de repartidores en Administración
- **Convivencia sobre recursos compartidos**, no dependencia operativa
- Administración debe evitar que un repartidor sea asignado simultáneamente a Logística y Paquetería

---

## 🗃️ ESTRUCTURA DE DATOS

### Entidades Principales

#### 1. **Entrega** (`Entregas`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | PK, autoincremental |
| `modulo_origen` | ENUM('restaurante', 'negocios') | Módulo que generó la entrega |
| `referencia_origen` | VARCHAR(100) | ID del pedido/orden en el módulo origen |
| `id_restaurante_negocio` | INT | ID del restaurante o negocio |
| `id_cliente` | INT | ID del cliente que recibirá |
| `direccion_entrega` | VARCHAR(500) | Dirección completa |
| `ciudad` | VARCHAR(100) | Ciudad de entrega |
| `coordenadas_lat` | DECIMAL(10,8) | Latitud (opcional inicial) |
| `coordenadas_lng` | DECIMAL(11,8) | Longitud (opcional inicial) |
| `telefono_contacto` | VARCHAR(20) | Teléfono del cliente |
| `monto_a_cobrar` | DECIMAL(10,2) | Monto que el repartidor debe cobrar |
| `estado_actual` | ENUM | Estado actual de la entrega |
| `notas_entrega` | TEXT | Notas especiales para el repartidor |
| `fecha_solicitada` | DATETIME | Cuándo se solicitó la entrega |
| `fecha_asignacion` | DATETIME | Cuándo se asignó repartidor |
| `fecha_entrega` | DATETIME | Cuándo se completó |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

**Índices**:
- `modulo_origen`, `referencia_origen` (búsqueda rápida desde origen)
- `id_cliente` (consultas por cliente)
- `estado_actual` (filtros operativos)
- `fecha_solicitada` (ordenamiento cronológico)

#### 2. **AsignacionEntrega** (`AsignacionesEntrega`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | PK, autoincremental |
| `id_entrega` | INT | FK a Entregas |
| `id_repartidor` | INT | ID del repartidor (referencia a Administración) |
| `fecha_asignacion` | DATETIME | Cuándo se asignó |
| `asignado_por` | INT | Usuario que realizó la asignación |
| `estado_asignacion` | ENUM('activa', 'reasignada', 'liberada') | Estado |
| `fecha_liberacion` | DATETIME | Si fue liberado/reasignado |
| `motivo_liberacion` | VARCHAR(255) | Razón de liberación |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

**Relación**: Una entrega puede tener múltiples asignaciones (reasignaciones), pero solo una activa.

**Índices**:
- `id_entrega` (buscar asignaciones de una entrega)
- `id_repartidor` (ver entregas de un repartidor)
- `estado_asignacion` (filtrar activas)

#### 3. **HistorialEstado** (`HistorialEstados`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | PK, autoincremental |
| `id_entrega` | INT | FK a Entregas |
| `estado_anterior` | VARCHAR(50) | Estado previo |
| `estado_nuevo` | VARCHAR(50) | Nuevo estado |
| `fecha_cambio` | DATETIME | Timestamp del cambio |
| `cambiado_por` | INT | Usuario/sistema que hizo el cambio |
| `tipo_cambio` | ENUM('manual', 'automatico') | Origen del cambio |
| `observaciones` | TEXT | Notas adicionales |
| `created_at` | TIMESTAMP | Fecha de creación |

**Propósito**: Auditoría completa de cambios de estado.

**Índices**:
- `id_entrega` (historial de una entrega)
- `fecha_cambio` (orden cronológico)

#### 4. **Incidencia** (`Incidencias`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | PK, autoincremental |
| `id_entrega` | INT | FK a Entregas |
| `tipo_incidencia` | ENUM | Ver tipos abajo |
| `descripcion` | TEXT | Detalle de la incidencia |
| `reportado_por` | INT | Quién reportó (repartidor, admin, etc.) |
| `fecha_reporte` | DATETIME | Cuándo se reportó |
| `estado_incidencia` | ENUM('reportada', 'en_revision', 'resuelta') | Estado |
| `resolucion` | TEXT | Cómo se resolvió |
| `fecha_resolucion` | DATETIME | Cuándo se resolvió |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

**Tipos de incidencia**:
- `cliente_no_responde`
- `direccion_incorrecta`
- `problema_comercio`
- `pedido_danado`
- `cancelacion_cliente`
- `otro`

**Índices**:
- `id_entrega` (incidencias de una entrega)
- `tipo_incidencia` (agrupar por tipo)
- `estado_incidencia` (filtrar pendientes)

---

## 🔄 FLUJOS OPERATIVOS

### Flujo 1: Crear Entrega desde Restaurante/Negocios

```
1. Restaurante/Negocios finaliza un pedido con entrega
2. Módulo origen hace POST /api/entregas con datos mínimos
3. Logística:
   - Valida datos requeridos
   - Crea registro en tabla Entregas con estado "pendiente"
   - Registra en HistorialEstado el estado inicial
   - Retorna ID de entrega y confirmación
4. Módulo origen guarda el ID de entrega como referencia
```

### Flujo 2: Asignar Repartidor a Entrega

```
1. Operador consulta entregas pendientes: GET /api/entregas?estado=pendiente
2. Operador consulta repartidores disponibles desde Administración
3. Operador asigna repartidor: POST /api/entregas/:id/asignar
   Body: { "id_repartidor": 123, "notas": "..." }
4. Logística:
   - Valida que entrega esté en estado válido
   - Consulta disponibilidad del repartidor en Administración
   - Crea registro en AsignacionesEntrega
   - Actualiza estado de entrega a "asignada"
   - Registra cambio en HistorialEstado
   - Notifica a Administración para marcar repartidor como ocupado
   - Retorna confirmación
```

### Flujo 3: Actualizar Estado de Entrega

```
1. Repartidor/Sistema actualiza estado: PATCH /api/entregas/:id/estado
   Body: { "estado": "en_camino", "observaciones": "..." }
2. Logística:
   - Valida transición de estado (según máquina de estados)
   - Actualiza estado_actual en Entregas
   - Registra cambio en HistorialEstado
   - Si estado = "entregada" o "cancelada", actualiza fecha_entrega
   - Si se libera entrega, actualiza AsignacionEntrega
   - Notifica cambio a módulo origen (opcional webhook/evento)
   - Retorna confirmación
```

### Flujo 4: Reportar Incidencia

```
1. Repartidor/Admin reporta problema: POST /api/entregas/:id/incidencias
   Body: { "tipo": "cliente_no_responde", "descripcion": "..." }
2. Logística:
   - Valida que entrega exista
   - Crea registro en Incidencias con estado "reportada"
   - Opcionalmente actualiza estado de entrega a "fallida" o "en_revision"
   - Registra en HistorialEstado
   - Notifica a supervisores (futuro)
   - Retorna ID de incidencia
```

### Flujo 5: Consultar Estado desde Módulo Origen

```
1. Restaurante/Negocios consulta: GET /api/entregas/:modulo/:referenciaOrigen
2. Logística:
   - Busca entrega por modulo_origen + referencia_origen
   - Incluye estado actual, repartidor asignado, historial reciente
   - Retorna información completa
```

---

## 🛣️ API REST - ENDPOINTS PRINCIPALES

### Entregas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/entregas` | Crear nueva entrega |
| `GET` | `/api/entregas` | Listar entregas (filtros: estado, fecha, módulo) |
| `GET` | `/api/entregas/:id` | Obtener detalle de entrega |
| `GET` | `/api/entregas/:modulo/:ref` | Buscar por referencia origen |
| `PATCH` | `/api/entregas/:id/estado` | Actualizar estado |
| `POST` | `/api/entregas/:id/asignar` | Asignar repartidor |
| `POST` | `/api/entregas/:id/liberar` | Liberar repartidor |
| `GET` | `/api/entregas/:id/historial` | Ver historial de estados |

### Asignaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/asignaciones/repartidor/:id` | Entregas de un repartidor |
| `GET` | `/api/asignaciones/activas` | Asignaciones activas |

### Incidencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/incidencias` | Reportar incidencia |
| `GET` | `/api/incidencias` | Listar incidencias |
| `GET` | `/api/incidencias/:id` | Detalle de incidencia |
| `PATCH` | `/api/incidencias/:id` | Actualizar/resolver incidencia |
| `GET` | `/api/entregas/:id/incidencias` | Incidencias de una entrega |

### Reportes y Métricas (Futuro)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/reportes/entregas-dia` | Entregas del día |
| `GET` | `/api/reportes/repartidor/:id` | Performance de repartidor |

---

## 🎨 ARQUITECTURA DEL MÓDULO

### Estructura de Carpetas

```
services/logistica/
├── context/                         # Documentación y contexto
│   ├── enunciadoprincipal.md       # Enunciado original
│   ├── CONTEXTOMODELS.md            # Patrones de arquitectura
│   ├── EXTERNAL_APIS.md             # APIs que consume
│   └── EnunciadoLogistica.md        # Este documento
│
├── db/                              # Configuración de base de datos
│   └── db.js                        # Conexión Sequelize
│
├── src/
│   ├── models/                      # Modelos de datos
│   │   ├── index.js                 # ⭐ Archivo central de relaciones
│   │   ├── entregas/
│   │   │   ├── index.js
│   │   │   └── entrega.model.js
│   │   ├── asignaciones/
│   │   │   ├── index.js
│   │   │   └── asignacion-entrega.model.js
│   │   ├── historial/
│   │   │   ├── index.js
│   │   │   └── historial-estado.model.js
│   │   └── incidencias/
│   │       ├── index.js
│   │       └── incidencia.model.js
│   │
│   ├── controllers/                 # Controladores (lógica de negocio)
│   │   ├── entregas/
│   │   │   ├── index.js
│   │   │   ├── entrega.controller.js
│   │   │   └── estado.controller.js
│   │   ├── asignaciones/
│   │   │   ├── index.js
│   │   │   └── asignacion.controller.js
│   │   └── incidencias/
│   │       ├── index.js
│   │       └── incidencia.controller.js
│   │
│   ├── routes/                      # Definición de rutas
│   │   ├── entregas/
│   │   │   ├── index.js
│   │   │   └── entregas.routes.js
│   │   ├── asignaciones/
│   │   │   ├── index.js
│   │   │   └── asignaciones.routes.js
│   │   └── incidencias/
│   │       ├── index.js
│   │       └── incidencias.routes.js
│   │
│   ├── services/                    # Servicios externos e integraciones
│   │   ├── index.js
│   │   ├── administracion.service.js  # Comunicación con módulo Admin
│   │   ├── restaurante.service.js     # Notificaciones a Restaurante
│   │   └── negocios.service.js        # Notificaciones a Negocios
│   │
│   ├── middlewares/                 # Middlewares
│   │   ├── index.js
│   │   ├── auth.middleware.js       # Validación de tokens
│   │   ├── validation.middleware.js # Validación de datos
│   │   └── error.middleware.js      # Manejo de errores
│   │
│   ├── helpers/                     # Funciones auxiliares
│   │   ├── index.js
│   │   ├── estado-validator.js      # Validar transiciones de estado
│   │   └── response.helper.js       # Formatos de respuesta
│   │
│   └── config/                      # Configuraciones
│       ├── index.js
│       ├── estados.config.js        # Definición de estados y transiciones
│       └── incidencias.config.js    # Tipos de incidencias
│
├── server.js                        # Punto de entrada
└── package.json
```

---

## 🧩 PATRÓN DE ARQUITECTURA

### Modelo Centralizado (Sequelize)

Siguiendo el patrón documentado en `CONTEXTOMODELS.md`:

1. **Modelos individuales**: Solo definen estructura de datos (sin relaciones)
2. **Relaciones centralizadas**: En `src/models/index.js`
3. **Exportación unificada**: Un solo punto de importación

**Ejemplo de relaciones esperadas**:

```javascript
// En src/models/index.js

// Entrega <-> HistorialEstado (1:N)
Entrega.hasMany(HistorialEstado, { 
  foreignKey: 'id_entrega', 
  as: 'historial' 
});
HistorialEstado.belongsTo(Entrega, { 
  foreignKey: 'id_entrega', 
  as: 'entrega' 
});

// Entrega <-> AsignacionEntrega (1:N)
Entrega.hasMany(AsignacionEntrega, { 
  foreignKey: 'id_entrega', 
  as: 'asignaciones' 
});
AsignacionEntrega.belongsTo(Entrega, { 
  foreignKey: 'id_entrega', 
  as: 'entrega' 
});

// Entrega <-> Incidencia (1:N)
Entrega.hasMany(Incidencia, { 
  foreignKey: 'id_entrega', 
  as: 'incidencias' 
});
Incidencia.belongsTo(Entrega, { 
  foreignKey: 'id_entrega', 
  as: 'entrega' 
});
```

---

## ⚙️ MÁQUINA DE ESTADOS

### Estados Válidos y Transiciones

```
pendiente
  ↓ (asignar repartidor)
asignada
  ↓ (comercio prepara pedido)
en_preparacion
  ↓ (pedido listo)
lista_para_recoger
  ↓ (repartidor recoge y sale)
en_camino
  ↓ (entrega exitosa)
entregada [FINAL]

Desde cualquier estado se puede ir a:
- cancelada [FINAL]
- fallida [FINAL] (con incidencia requerida)
```

### Validaciones de Transición

| Estado Origen | Estados Destino Permitidos |
|---------------|----------------------------|
| `pendiente` | `asignada`, `cancelada` |
| `asignada` | `en_preparacion`, `cancelada` |
| `en_preparacion` | `lista_para_recoger`, `cancelada` |
| `lista_para_recoger` | `en_camino`, `cancelada` |
| `en_camino` | `entregada`, `fallida`, `cancelada` |
| `entregada` | *(ninguno - estado final)* |
| `cancelada` | *(ninguno - estado final)* |
| `fallida` | *(ninguno - estado final)* |

Implementar en `src/helpers/estado-validator.js`:

```javascript
const transicionesPermitidas = {
  'pendiente': ['asignada', 'cancelada'],
  'asignada': ['en_preparacion', 'cancelada'],
  // ...
};

function validarTransicion(estadoActual, estadoNuevo) {
  return transicionesPermitidas[estadoActual]?.includes(estadoNuevo);
}
```

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Autenticación

- Todos los endpoints requieren token JWT válido
- Validar token con servicio de Autenticación
- Middleware: `auth.middleware.js`

### Autorización

- Roles esperados:
  - `admin`: Acceso completo
  - `operador_logistica`: Gestionar entregas y asignaciones
  - `repartidor`: Ver sus entregas asignadas, actualizar estados
  - `restaurante`/`negocios`: Crear entregas, consultar sus propias entregas
  
### Validaciones de Datos

- Validar campos requeridos en creación de entrega
- Validar formato de coordenadas (lat: -90 a 90, lng: -180 a 180)
- Validar montos positivos
- Validar transiciones de estado permitidas
- Validar que repartidor esté disponible antes de asignar

---

## 📊 MÉTRICAS Y OBSERVABILIDAD (Futuro)

### Métricas Clave

- Total de entregas por día/semana/mes
- Entregas completadas vs fallidas
- Tiempo promedio por estado
- Incidencias más frecuentes
- Rendimiento por repartidor
- Entregas por módulo origen

### Logs

- Registrar todas las operaciones críticas:
  - Creación de entregas
  - Asignaciones y reasignaciones
  - Cambios de estado
  - Incidencias reportadas
  
### Alertas

- Entregas sin asignar por más de X minutos
- Entregas en estado "en_camino" por más de Y minutos
- Incidencias sin resolver

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos y Modelos ✅ (Prioridad Alta)

1. Crear tablas en base de datos
2. Implementar modelos Sequelize:
   - `entrega.model.js`
   - `asignacion-entrega.model.js`
   - `historial-estado.model.js`
   - `incidencia.model.js`
3. Definir relaciones en `index.js`
4. Probar sincronización con BD

### Fase 2: Endpoints de Entregas (Prioridad Alta)

1. Controlador de entregas básico
2. Rutas CRUD de entregas
3. Validaciones de entrada
4. Integración con servicio de Administración (repartidores)

### Fase 3: Sistema de Estados e Historial (Prioridad Alta)

1. Implementar validador de transiciones
2. Endpoint de actualización de estado
3. Registro automático en historial
4. Tests de máquina de estados

### Fase 4: Asignaciones de Repartidores (Prioridad Media)

1. Endpoint de asignación
2. Consulta de disponibilidad en Administración
3. Actualización de estado operativo en Admin
4. Endpoint de liberación/reasignación

### Fase 5: Incidencias (Prioridad Media)

1. CRUD de incidencias
2. Asociación con entregas
3. Flujo de resolución

### Fase 6: Integración con Restaurante/Negocios (Prioridad Media)

1. Endpoints de creación desde módulos origen
2. Consultas por referencia origen
3. Webhooks/eventos de actualización (opcional)

### Fase 7: Reportes y Métricas (Prioridad Baja)

1. Endpoints de reportes básicos
2. Dashboard de métricas
3. Exportación de datos

---

## 🧪 CASOS DE PRUEBA CRÍTICOS

### Test 1: Crear Entrega desde Restaurante
- Restaurante envía solicitud válida
- Se crea entrega en estado "pendiente"
- Se registra en historial
- Retorna ID de entrega

### Test 2: Asignar Repartidor Disponible
- Entrega en estado "pendiente"
- Repartidor disponible en Administración
- Asignación exitosa
- Estado cambia a "asignada"
- Admin actualiza repartidor como ocupado

### Test 3: Rechazar Transición Inválida
- Intentar pasar de "pendiente" a "entregada" directamente
- Sistema rechaza con error descriptivo

### Test 4: Registrar Incidencia y Fallar Entrega
- Entrega en estado "en_camino"
- Repartidor reporta "cliente_no_responde"
- Se crea incidencia
- Estado cambia a "fallida"

### Test 5: Consultar Entrega desde Módulo Origen
- Negocios consulta por su referencia
- Sistema retorna solo entregas de ese módulo
- Incluye estado actual y repartidor

---

## 📚 DOCUMENTACIÓN ADICIONAL REQUERIDA

1. **Swagger/OpenAPI**: Documentar todos los endpoints
2. **Diagramas ER**: Relaciones entre tablas
3. **Diagramas de Flujo**: Procesos operativos clave
4. **Manual de Operador**: Cómo usar el sistema
5. **Manual de Integración**: Para desarrolladores de Restaurante/Negocios

---

## 🔮 FUNCIONALIDADES FUTURAS (Backlog)

### V2.0 - Geolocalización
- Tracking en tiempo real de repartidores
- Mapa de entregas activas
- Notificaciones push al cliente

### V2.1 - Evidencias
- Fotos de entrega
- Firma digital del cliente
- Almacenamiento en cloud

### V2.2 - Optimización de Rutas
- Algoritmo de asignación inteligente
- Agrupación de entregas por zona
- Sugerencia de rutas óptimas

### V2.3 - Liquidaciones
- Cálculo automático de comisiones
- Reportes de pagos a repartidores
- Integración con módulo de Nómina

### V2.4 - Notificaciones Avanzadas
- SMS/Email al cliente
- Webhooks a módulos origen
- Alertas de incidencias críticas

---

## 📞 CONTACTOS Y RESPONSABLES

- **Módulo**: Logística
- **Dependencias críticas**: Administración (repartidores)
- **Clientes**: Restaurante, Negocios
- **Convivencia**: Paquetería (uso compartido de repartidores)

---

## 📝 NOTAS FINALES

- Este módulo es **especializado y acotado**: solo gestiona entregas comerciales
- **No sustituye** la lógica de Restaurante, Negocios ni Paquetería
- **Centraliza y desacopla** la operación de reparto
- **Escalable**: Preparado para crecer con funcionalidades avanzadas
- **Mantenible**: Arquitectura modular siguiendo patrones establecidos

---

**Versión**: 1.0  
**Fecha**: 2026-03-12  
**Estado**: Diseño Completo - Listo para Implementación
