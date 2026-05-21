# 🔄 Migración a PostgreSQL - Módulo de Logística

## ✅ Resumen de Cambios

Se ha migrado exitosamente el módulo de logística de **MySQL** a **PostgreSQL v3.0**, actualizando todos los modelos y configuraciones según el nuevo esquema de base de datos.

---

## 📋 Cambios Principales

### 1. Configuración de Base de Datos (`db/db.js`)

**Cambios realizados:**
- ✅ Dialecto cambiado de `mysql` a `postgres`
- ✅ Puerto actualizado de `3306` a `5432`
- ✅ Credenciales configuradas: `admin` / `admin123`
- ✅ Eliminadas configuraciones específicas de MySQL (`charset`, `collate`)

**Archivo `.env` actualizado:**
```env
DB_NAME=modulo_logistica_db
DB_USER=admin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432
```

---

### 2. Modelos Actualizados

#### **Repartidor** (`repartidores/repartidor.model.js`)
**Campos nuevos:**
- `estado` (ENUM: disponible, ocupado, inactivo)
- `ultima_lat`, `ultima_lng`, `ultima_ubicacion_at` (tracking)
- `ws_estado`, `ws_conectado_at`, `ws_desconectado_at` (WebSocket)
- `total_entregas`, `total_cancelaciones` (métricas)
- `calificacion_promedio` (DECIMAL 3,2)

**Campos eliminados:**
- `usuario_id`, `codigo_repartidor`, `nombres`, `apellidos`, `telefono`, `correo`, `activo`

> **Nota:** Los datos personales del repartidor ahora viven en el módulo de usuarios externo.

---

#### **Entrega** (`entregas/entrega.model.js`)
**Campos nuevos:**
- `categoria_id` (FK → categorias_orden)
- `metodo_pago` (ENUM: CASH, CARD)
- `tarifa_ofrecida`, `distancia_estimada_km`
- `negocio_nombre`, `negocio_telefono`, `negocio_direccion`
- `origen_lat`, `origen_lng` (coordenadas del negocio)
- `cliente_nombre`, `cliente_telefono`
- `destino_lat`, `destino_lng` (coordenadas del cliente)
- `detalles_orden` (JSONB - lista de productos)
- `cancelacion_auto_at`, `motivo_cancelacion`

**Beneficio:** Persistencia completa de datos del negocio y cliente para independencia operativa.

---

#### **AsignacionEntrega** (`asignaciones/asignacion-entrega.model.js`)
**Cambios:**
- ✅ Agregado campo `fecha_liberacion`
- ✅ Tipos de datos actualizados a `BIGINT` (sin UNSIGNED)
- ✅ FK a `repartidores` agregada

---

#### **HistorialEstadoEntrega** (`historial/historial-estado.model.js`)
**Campos nuevos:**
- `repartidor_id` (contexto: quién era el repartidor en ese momento)
- `origen_cambio` (manual, repartidor, sistema, negocio)

---

#### **IncidenciaEntrega** (`incidencias/incidencia.model.js`)
**Campos nuevos para resolución:**
- `resuelta_por_usuario_id`
- `comentario_resolucion`
- `resuelta_at`

---

### 3. Modelos Nuevos Creados

#### **CategoriaOrden** (`categorias/categoria-orden.model.js`)
Sistema dinámico de categorías de negocio gestionado desde administración.

**Campos:**
- `codigo` (FOOD, MARKET, PHARMACY, PACKAGE)
- `nombre`, `descripcion`
- `icono`, `color_hex`
- `orden_display`, `activa`

**Datos iniciales:**
```sql
FOOD     - Comida        - #FF6B35
MARKET   - Supermercado  - #4CAF50
PHARMACY - Farmacia      - #2196F3
PACKAGE  - Paquetería    - #9C27B0
```

---

#### **HistorialUbicacionRepartidor** (`ubicaciones/historial-ubicacion-repartidor.model.js`)
Registro de posiciones emitidas por WebSocket para tracking en tiempo real.

**Campos:**
- `repartidor_id`, `entrega_id` (NULL si está disponible)
- `lat`, `lng`, `heading` (dirección en grados)

**Uso:** Rastreo en tiempo real, análisis de rutas, auditoría de recorridos.

---

#### **NotificacionLogistica** (`notificaciones/notificacion-logistica.model.js`)
Log de notificaciones enviadas al módulo de negocios.

**Campos:**
- `evento` (ACCEPTED, PICKED_UP, DELIVERED, CANCELLED, FAILED)
- `destino_url`, `payload` (JSONB)
- `exitosa`, `http_status`, `respuesta`
- `intentos`, `ultimo_intento_at`

**Beneficio:** Permite reintentos y auditoría de la integración.

---

#### **CalificacionEntrega** (`calificaciones/calificacion-entrega.model.js`)
Sistema de calificaciones del repartidor.

**Campos:**
- `entrega_id` (UNIQUE - una calificación por entrega)
- `repartidor_id`
- `puntuacion` (1-5)
- `comentario`, `calificado_por`

**Trigger automático:** Actualiza `calificacion_promedio` en `repartidores`.

---

### 4. Modelos Eliminados

❌ **EstadoOperativoRepartidor**
- Funcionalidad integrada directamente en el modelo `Repartidor`

---

## 🔗 Relaciones Actualizadas

El archivo `models/index.js` ahora incluye:

```javascript
// Nuevas relaciones agregadas:
CategoriaOrden → Entrega (1:N)
Repartidor → HistorialUbicacionRepartidor (1:N)
Repartidor → CalificacionEntrega (1:N)
Repartidor → HistorialEstadoEntrega (1:N)
Entrega → NotificacionLogistica (1:N)
Entrega → CalificacionEntrega (1:1)
Entrega → HistorialUbicacionRepartidor (1:N)
```

---

## 🚀 Próximos Pasos

### 1. Instalar Dependencias de PostgreSQL

```bash
cd /home/lufi/programacion/pedidos-now-logistica/services/logistica
npm install pg pg-hstore
```

### 2. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U admin -h localhost

# Crear base de datos
CREATE DATABASE modulo_logistica_db;

# Salir
\q
```

### 3. Ejecutar Script SQL

```bash
psql -U admin -h localhost -d modulo_logistica_db -f db/logistica-v3.sql
```

Este script creará:
- ✅ Extensiones (uuid-ossp, postgis)
- ✅ Tipos ENUM
- ✅ Todas las tablas con constraints
- ✅ Índices optimizados
- ✅ Triggers automáticos
- ✅ Vistas útiles
- ✅ Datos iniciales de categorías

### 4. Verificar Modelos

```bash
node test-models.js
```

---

## 📊 Estructura Final de Modelos

```
src/models/
├── index.js (archivo central)
├── categorias/
│   ├── categoria-orden.model.js
│   └── index.js
├── repartidores/
│   ├── repartidor.model.js
│   └── index.js
├── entregas/
│   ├── entrega.model.js
│   └── index.js
├── asignaciones/
│   ├── asignacion-entrega.model.js
│   └── index.js
├── historial/
│   ├── historial-estado.model.js
│   └── index.js
├── incidencias/
│   ├── incidencia.model.js
│   └── index.js
├── ubicaciones/
│   ├── historial-ubicacion-repartidor.model.js
│   └── index.js
├── notificaciones/
│   ├── notificacion-logistica.model.js
│   └── index.js
└── calificaciones/
    ├── calificacion-entrega.model.js
    └── index.js
```

**Total: 9 modelos** (anteriormente 6)

---

## ⚙️ Características PostgreSQL Aprovechadas

1. **JSONB**: Campo `detalles_orden` con índice GIN para búsquedas eficientes
2. **ENUM Types**: Tipos enumerados a nivel de base de datos
3. **Triggers**: Actualización automática de métricas y timestamps
4. **Vistas**: `v_entregas_pendientes_feed`, `v_entregas_activas`, `v_repartidores_disponibles`
5. **Índices parciales**: Optimizados con cláusulas WHERE
6. **PostGIS (opcional)**: Extensión disponible para consultas geoespaciales avanzadas

---

## 📝 Notas Importantes

1. **No se usa Sequelize.sync() en producción**: El schema se crea con el archivo SQL
2. **Timestamps manejados por PostgreSQL**: Triggers automáticos para `updated_at`
3. **Tipos de datos**: Se removió UNSIGNED (no existe en PostgreSQL)
4. **ENUMs centralizados**: Definidos a nivel de base de datos para consistencia
5. **Cancelación automática**: Job scheduler puede usar campo `cancelacion_auto_at`

---

## 🎯 Beneficios de la Migración

✅ **Escalabilidad**: PostgreSQL maneja mejor concurrencia y grandes volúmenes
✅ **JSONB**: Búsquedas eficientes en datos semi-estructurados
✅ **Integridad**: Constraints y triggers a nivel de base de datos
✅ **Extensibilidad**: PostGIS para consultas geoespaciales avanzadas
✅ **Mantenibilidad**: Schema versionado y documentado

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
**Solución:** Ejecutar el script SQL completo `db/logistica-v3.sql`

### Error: "role does not exist"
**Solución:**
```bash
# Crear usuario admin
sudo -u postgres createuser -s admin
sudo -u postgres psql -c "ALTER USER admin WITH PASSWORD 'admin123';"
```

### Error al conectar
**Verificar:**
- PostgreSQL está corriendo: `sudo systemctl status postgresql`
- Puerto 5432 está abierto
- Credenciales en `.env` son correctas

---

**Fecha de migración:** 2026-04-02  
**Versión de esquema:** PostgreSQL v3.0  
**Modelos migrados:** 9 de 9 ✅
