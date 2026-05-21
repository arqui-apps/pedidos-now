# ✅ MODELOS SEQUELIZE CREADOS - MÓDULO LOGÍSTICA

## 📊 RESUMEN EJECUTIVO

Se han creado **6 modelos Sequelize** basados en el schema SQL existente en `db/logistica.sql`.

---

## 📦 MODELOS CREADOS

### 1️⃣ **REPARTIDORES** (desde Administración)

#### `Repartidor` (`repartidores`)
**Archivo**: `src/models/repartidores/repartidor.model.js`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_repartidor` | BIGINT | PK, autoincremental |
| `usuario_id` | BIGINT | ID usuario (único) |
| `codigo_repartidor` | VARCHAR(30) | Código único |
| `nombres` | VARCHAR(120) | Nombres |
| `apellidos` | VARCHAR(120) | Apellidos |
| `telefono` | VARCHAR(20) | Teléfono contacto |
| `correo` | VARCHAR(120) | Email (opcional) |
| `activo` | BOOLEAN | Estado activo/inactivo |
| `created_at` | DATETIME | Fecha creación |
| `updated_at` | DATETIME | Fecha actualización |

#### `EstadoOperativoRepartidor` (`estados_operativos_repartidor`)
**Archivo**: `src/models/repartidores/estado-operativo-repartidor.model.js`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_estado_operativo` | BIGINT | PK, autoincremental |
| `repartidor_id` | BIGINT | FK a repartidores (único) |
| `estado` | ENUM | disponible, ocupado, en_ruta, desconectado, inactivo, suspendido |
| `modulo_actual` | ENUM | logistica, paqueteria, ninguno |
| `ultimo_login` | DATETIME | Última conexión |
| `ultima_actividad` | DATETIME | Última actividad |
| `updated_at` | DATETIME | Fecha actualización |

---

### 2️⃣ **ENTREGAS**

#### `Entrega` (`entregas`)
**Archivo**: `src/models/entregas/entrega.model.js`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_entrega` | BIGINT | PK, autoincremental |
| `tipo_origen` | ENUM | restaurante, negocio |
| `origen_id` | BIGINT | ID pedido origen |
| `empresa_id` | BIGINT | ID restaurante/negocio |
| `sucursal_id` | BIGINT | ID sucursal (opcional) |
| `cliente_id` | BIGINT | ID cliente |
| `repartidor_id` | BIGINT | FK a repartidores (opcional) |
| `estado_entrega` | ENUM | 8 estados (ver abajo) |
| `direccion_entrega` | TEXT | Dirección completa |
| `referencia_direccion` | VARCHAR(255) | Referencias adicionales |
| `instrucciones_entrega` | TEXT | Instrucciones especiales |
| `monto_cobrar` | DECIMAL(10,2) | Monto a cobrar |
| `fecha_entrega_estimada` | DATETIME | Fecha estimada |
| `fecha_entrega_real` | DATETIME | Fecha real entrega |
| `created_at` | DATETIME | Fecha creación |
| `updated_at` | DATETIME | Fecha actualización |

**Estados válidos**: `pendiente`, `asignada`, `en_preparacion`, `lista_para_recoger`, `en_camino`, `entregada`, `cancelada`, `fallida`

**Índices**:
- Único: `tipo_origen + origen_id`
- `empresa_id`, `sucursal_id`, `cliente_id`, `repartidor_id`, `estado_entrega`

---

### 3️⃣ **ASIGNACIONES**

#### `AsignacionEntrega` (`asignaciones_entrega`)
**Archivo**: `src/models/asignaciones/asignacion-entrega.model.js`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_asignacion` | BIGINT | PK, autoincremental |
| `entrega_id` | BIGINT | FK a entregas |
| `repartidor_id` | BIGINT | FK a repartidores |
| `asignado_por_usuario_id` | BIGINT | Usuario que asignó |
| `fecha_asignacion` | DATETIME | Fecha/hora asignación |
| `activa` | BOOLEAN | Si es la asignación activa |
| `created_at` | DATETIME | Fecha creación |

**Propósito**: Historial de asignaciones (permite reasignaciones).

**Índices**: `entrega_id`, `repartidor_id`, `activa`

---

### 4️⃣ **HISTORIAL**

#### `HistorialEstadoEntrega` (`historial_estados_entrega`)
**Archivo**: `src/models/historial/historial-estado.model.js`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_historial_estado` | BIGINT | PK, autoincremental |
| `entrega_id` | BIGINT | FK a entregas |
| `estado_anterior` | ENUM | Estado previo (nullable) |
| `estado_nuevo` | ENUM | Nuevo estado |
| `cambiado_por_usuario_id` | BIGINT | Usuario que cambió |
| `comentario` | TEXT | Observaciones |
| `created_at` | DATETIME | Fecha cambio |

**Propósito**: Auditoría completa de cambios de estado.

**Índices**: `entrega_id`, `estado_nuevo`, `created_at`

---

### 5️⃣ **INCIDENCIAS**

#### `IncidenciaEntrega` (`incidencias_entrega`)
**Archivo**: `src/models/incidencias/incidencia.model.js`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_incidencia` | BIGINT | PK, autoincremental |
| `entrega_id` | BIGINT | FK a entregas |
| `repartidor_id` | BIGINT | FK a repartidores (opcional) |
| `tipo_incidencia` | ENUM | Ver tipos abajo |
| `descripcion` | TEXT | Descripción detallada |
| `resuelta` | BOOLEAN | Si fue resuelta |
| `created_at` | DATETIME | Fecha reporte |
| `updated_at` | DATETIME | Fecha actualización |

**Tipos de incidencia**: `cliente_no_responde`, `direccion_incorrecta`, `problema_en_comercio`, `pedido_danado`, `cancelacion_cliente`, `otro`

**Índices**: `entrega_id`, `repartidor_id`, `tipo_incidencia`, `resuelta`

---

## 🔗 RELACIONES DEFINIDAS

Todas las relaciones están configuradas en `src/models/index.js`:

### Repartidor:
- `→ entregas` (1:N) - Entregas asignadas
- `→ asignaciones` (1:N) - Historial de asignaciones
- `→ incidencias_reportadas` (1:N) - Incidencias reportadas
- `→ estado_operativo` (1:1) - Estado operativo actual

### Entrega:
- `→ historial` (1:N) - Historial de cambios de estado
- `→ asignaciones` (1:N) - Historial de asignaciones
- `→ incidencias` (1:N) - Incidencias de la entrega
- `→ repartidor` (N:1) - Repartidor asignado actualmente

### AsignacionEntrega:
- `→ entrega` (N:1) - Entrega asignada
- `→ repartidor` (N:1) - Repartidor asignado

### HistorialEstadoEntrega:
- `→ entrega` (N:1) - Entrega relacionada

### IncidenciaEntrega:
- `→ entrega` (N:1) - Entrega afectada
- `→ repartidor` (N:1) - Repartidor que reportó

---

## 📁 ARCHIVOS ADICIONALES CREADOS

### `db/db.js`
Archivo de conexión Sequelize con:
- Configuración de pool de conexiones
- Función `testConnection()` para verificar conexión
- Función `syncDatabase()` para sincronizar modelos
- Soporte para variables de entorno

### `test-models.js`
Script de prueba que:
- ✅ Verifica conexión a BD
- ✅ Valida que todos los modelos están cargados
- ✅ Comprueba que las relaciones están configuradas
- ✅ Sincroniza modelos con la base de datos
- ✅ Muestra resumen visual

**Ejecutar**: `node test-models.js`

---

## 🚀 CÓMO USAR LOS MODELOS

### Importación:

```javascript
// Importar todos los modelos desde el index central
const {
    Repartidor,
    EstadoOperativoRepartidor,
    Entrega,
    AsignacionEntrega,
    HistorialEstadoEntrega,
    IncidenciaEntrega
} = require('./src/models');
```

### Ejemplo de consulta con relaciones:

```javascript
// Obtener entrega con toda su información
const entrega = await Entrega.findByPk(1, {
    include: [
        {
            model: Repartidor,
            as: 'repartidor',
            attributes: ['id_repartidor', 'nombres', 'apellidos', 'telefono']
        },
        {
            model: AsignacionEntrega,
            as: 'asignaciones',
            where: { activa: true },
            required: false
        },
        {
            model: HistorialEstadoEntrega,
            as: 'historial',
            order: [['created_at', 'DESC']],
            limit: 10
        },
        {
            model: IncidenciaEntrega,
            as: 'incidencias',
            where: { resuelta: false },
            required: false
        }
    ]
});
```

### Crear nueva entrega:

```javascript
const nuevaEntrega = await Entrega.create({
    tipo_origen: 'restaurante',
    origen_id: 123,
    empresa_id: 456,
    cliente_id: 789,
    direccion_entrega: 'Calle Principal 123',
    monto_cobrar: 45.50,
    estado_entrega: 'pendiente'
});
```

---

## ✅ PATRÓN DE ARQUITECTURA

Los modelos siguen el **patrón de Index Centralizado**:

1. ✅ Cada modelo define solo su estructura de datos
2. ✅ **NO** se definen relaciones dentro de los archivos `.model.js`
3. ✅ Todas las relaciones se centralizan en `src/models/index.js`
4. ✅ Exportación unificada desde un solo punto

**Ventajas**:
- ✅ Evita dependencias circulares
- ✅ Relaciones fáciles de visualizar
- ✅ Mantenimiento simplificado
- ✅ Importación consistente

---

## 🔧 VARIABLES DE ENTORNO

Crear archivo `.env` con:

```env
# Base de datos
DB_NAME=modulo_logistica_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306

# Entorno
NODE_ENV=development
```

---

## 📊 ESTADÍSTICAS

| Métrica | Valor |
|---------|-------|
| **Modelos creados** | 6 |
| **Archivos .model.js** | 6 |
| **Archivos index.js** | 6 (5 subcarpetas + 1 central) |
| **Relaciones definidas** | 10 |
| **Tablas en BD** | 6 |
| **Líneas de código** | ~650 |

---

## ✅ CHECKLIST FASE 1 COMPLETADA

- [x] `entrega.model.js` creado con todos los campos
- [x] `asignacion-entrega.model.js` creado
- [x] `historial-estado.model.js` creado
- [x] `incidencia.model.js` creado
- [x] `repartidor.model.js` creado
- [x] `estado-operativo-repartidor.model.js` creado
- [x] Todos los archivos index.js actualizados
- [x] `src/models/index.js` con todas las relaciones
- [x] Archivo de conexión `db/db.js` creado
- [x] Script de prueba `test-models.js` creado

---

## 🎯 PRÓXIMOS PASOS

### Fase 2: Endpoints de Entregas
- Crear controladores en `src/controllers/entregas/`
- Definir rutas en `src/routes/entregas/`
- Implementar validaciones

### Fase 3: Sistema de Estados
- Crear helper `estado-validator.js`
- Implementar automático de historial
- Tests de transiciones

---

**Fecha**: 2026-03-12  
**Estado**: ✅ Fase 1 Completada  
**Próximo**: Fase 2 - Endpoints de Entregas
