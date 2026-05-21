# 🚚 MÓDULO DE LOGÍSTICA

## 📌 RESUMEN EJECUTIVO

Módulo especializado en **gestionar entregas comerciales** generadas por los módulos de **Restaurante** y **Negocios**. Centraliza la asignación de repartidores, control de estados, historial y registro de incidencias.

---

## 🎯 PROPÓSITO

- ✅ Evitar duplicidad de lógica de entregas entre Restaurante y Negocios
- ✅ Centralizar operación de reparto en una capa especializada
- ✅ Mantener trazabilidad completa del flujo de entregas
- ✅ Registrar y gestionar incidencias operativas

---

## 📂 ESTADO ACTUAL

### ✅ Completado:
- Estructura de carpetas siguiendo patrón del proyecto
- Archivos placeholder (`index.js`) en todas las carpetas
- Documentación completa del módulo
- Base para implementación de modelos Sequelize

### 🔨 Pendiente:
- **Fase 1**: Crear modelos Sequelize (4 entidades)
- **Fase 2**: Implementar endpoints de entregas
- **Fase 3**: Sistema de estados e historial
- **Fase 4**: Asignaciones de repartidores
- **Fase 5**: Gestión de incidencias

---

## 📖 DOCUMENTACIÓN

Toda la documentación está en la carpeta **`context/`**:

| Archivo | Descripción |
|---------|-------------|
| **`PROMPT_CLAUDE_CODE.md`** | 🔥 Guía para implementar con Claude Code |
| **`EnunciadoLogistica.md`** | 🔥 Especificación completa del módulo |
| **`ESTRUCTURA_GENERADA.md`** | 📋 Resumen de la estructura creada |
| **`CONTEXTOMODELS.md`** | 🏗️ Patrón de arquitectura Sequelize |
| **`enunciadoprincipal.md`** | 💡 Concepto original del módulo |
| **`EXTERNAL_APIS.md`** | 🔗 Referencia de APIs externas |

---

## 🏗️ ARQUITECTURA

### Estructura de Carpetas:

```
src/
├── models/           # Modelos de datos (4 entidades)
├── controllers/      # Lógica de negocio
├── routes/           # Definición de endpoints
├── services/         # Integraciones con otros módulos
├── middlewares/      # Validación, autenticación, errores
├── helpers/          # Funciones auxiliares
└── config/           # Configuraciones (estados, incidencias)
```

### Módulos Funcionales:

1. **Entregas**: Gestión del ciclo de vida de entregas
2. **Asignaciones**: Asignación de repartidores
3. **Historial**: Auditoría de cambios de estado
4. **Incidencias**: Registro de problemas operativos

---

## 🗃️ ENTIDADES

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| `Entrega` | `Entregas` | Registro maestro de cada entrega |
| `AsignacionEntrega` | `AsignacionesEntrega` | Asignaciones de repartidores |
| `HistorialEstado` | `HistorialEstados` | Auditoría de cambios |
| `Incidencia` | `Incidencias` | Problemas reportados |

---

## 🔗 INTEGRACIONES

### Consume de:
- **Administración**: Información de repartidores disponibles
- **Autenticación**: Validación de tokens JWT

### Sirve a:
- **Restaurante**: Entregas de pedidos de comida
- **Negocios**: Entregas de compras comerciales

### Convive con:
- **Paquetería**: Uso compartido de repartidores (vía Administración)

---

## 🚀 CÓMO EMPEZAR

### 1. **Lee la documentación**:
```bash
# Documentos clave en orden:
context/PROMPT_CLAUDE_CODE.md       # Guía de implementación
context/EnunciadoLogistica.md       # Especificación completa
context/CONTEXTOMODELS.md           # Patrón de arquitectura
```

### 2. **Implementa Fase 1** (Modelos):
```bash
# Crear 4 archivos .model.js:
src/models/entregas/entrega.model.js
src/models/asignaciones/asignacion-entrega.model.js
src/models/historial/historial-estado.model.js
src/models/incidencias/incidencia.model.js

# Actualizar:
src/models/index.js  # Importar modelos y definir relaciones
```

### 3. **Prueba la sincronización**:
```javascript
// En server.js o script de prueba
const { sequelize } = require('./src/models');
await sequelize.sync({ force: true }); // Solo en desarrollo
```

---

## 🎓 PATRÓN DE ARQUITECTURA

Este módulo sigue el **patrón de Index Centralizado** para Sequelize:

1. ✅ Cada modelo define solo su estructura (sin relaciones)
2. ✅ Todas las relaciones se definen en `src/models/index.js`
3. ✅ Importación unificada: `const { Entrega } = require('./models');`
4. ✅ Organización por dominio funcional

Ver `context/CONTEXTOMODELS.md` para detalles completos.

---

## 📊 ESTADOS DE ENTREGA

```
pendiente → asignada → en_preparacion → lista_para_recoger 
  → en_camino → entregada ✅

Desde cualquier estado: → cancelada ❌ | fallida ❌
```

---

## 🛣️ API REST (Planificada)

### Entregas:
- `POST /api/entregas` - Crear entrega
- `GET /api/entregas` - Listar entregas
- `GET /api/entregas/:id` - Detalle de entrega
- `PATCH /api/entregas/:id/estado` - Actualizar estado
- `POST /api/entregas/:id/asignar` - Asignar repartidor

### Asignaciones:
- `GET /api/asignaciones/repartidor/:id` - Entregas de repartidor
- `GET /api/asignaciones/activas` - Asignaciones activas

### Incidencias:
- `POST /api/incidencias` - Reportar incidencia
- `GET /api/incidencias` - Listar incidencias
- `PATCH /api/incidencias/:id` - Resolver incidencia

Ver especificación completa en `context/EnunciadoLogistica.md`.

---

## ⚙️ TECNOLOGÍAS

- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Sequelize
- **Base de datos**: MySQL
- **Arquitectura**: REST API / Microservicios

---

## 📝 CONVENCIONES

### Nomenclatura:
- **Archivos**: `kebab-case.model.js`
- **Clases**: `PascalCase`
- **Tablas**: `PascalCase` plural
- **Campos**: `snake_case`
- **Foreign Keys**: `id_nombre`

### Timestamps:
```javascript
{
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}
```

---

## 🔒 SEGURIDAD

- Todos los endpoints requieren autenticación JWT
- Validación de datos en entrada
- Validación de transiciones de estado
- Verificación de disponibilidad de repartidores

---

## 📞 CONTACTO

- **Módulo**: Logística
- **Dependencias críticas**: Administración, Autenticación
- **Clientes**: Restaurante, Negocios
- **Estado**: En desarrollo (Fase 1 pendiente)

---

**Versión**: 1.0  
**Fecha**: 2026-03-12  
**Estado**: ✅ Estructura creada | 🔨 Modelos pendientes
