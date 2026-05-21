# 🚚 MÓDULO DE LOGÍSTICA - PROMPT PARA CLAUDE CODE

## 🎯 OBJETIVO

Implementar el **Módulo de Logística** como una capa centralizada para gestionar entregas generadas por los módulos de **Restaurante** y **Negocios**, evitando duplicidad de código y centralizando la operación de reparto.

---

## 📋 CONTEXTO GENERAL

### ¿Qué es este módulo?

El módulo de Logística es un microservicio especializado en **gestionar la operación de entregas** comerciales. NO es un sistema completo de delivery, sino una capa operativa que:

- ✅ Recibe solicitudes de entrega desde Restaurante y Negocios
- ✅ Asigna repartidores disponibles (consultando desde Administración)
- ✅ Controla el ciclo de vida de cada entrega (estados)
- ✅ Mantiene historial de cambios para trazabilidad
- ✅ Registra incidencias operativas
- ❌ NO gestiona catálogos, carritos, pagos, ni creación de pedidos

### Arquitectura del proyecto

Este módulo forma parte de un ecosistema de microservicios:

```
┌─────────────────┐
│  RESTAURANTE    │──┐
└─────────────────┘  │
                     ├──► ┌──────────────┐
┌─────────────────┐  │    │  LOGÍSTICA   │
│    NEGOCIOS     │──┘    │ (este módulo)│
└─────────────────┘       └──────┬───────┘
                                 │
                          ┌──────▼────────┐
                          │ ADMINISTRACIÓN│
                          │ (repartidores)│
                          └───────────────┘
```

### Tecnologías base

- **Backend**: Node.js + Express
- **ORM**: Sequelize
- **Base de datos**: MySQL
- **Arquitectura**: REST API
- **Patrón de modelos**: Centralizado (ver `context/CONTEXTOMODELS.md`)

---

## 📂 ESTRUCTURA YA CREADA

Ya se generó la estructura de carpetas base:

```
services/logistica/
├── context/                         # ⭐ LEE PRIMERO ESTOS DOCUMENTOS
│   ├── enunciadoprincipal.md       # Concepto original del módulo
│   ├── CONTEXTOMODELS.md            # Patrón de arquitectura Sequelize
│   ├── EXTERNAL_APIS.md             # APIs que consume (referencia)
│   └── EnunciadoLogistica.md        # ⭐⭐ DOCUMENTO MAESTRO - LÉELO
│
├── db/
│   └── db.js                        # Conexión a base de datos
│
├── src/
│   ├── models/                      # Modelos de datos
│   │   ├── index.js                 # ⭐ Archivo central (ya tiene estructura base)
│   │   ├── entregas/
│   │   │   └── index.js             # Placeholder
│   │   ├── asignaciones/
│   │   │   └── index.js
│   │   ├── historial/
│   │   │   └── index.js
│   │   └── incidencias/
│   │       └── index.js
│   │
│   ├── controllers/
│   │   ├── entregas/
│   │   ├── asignaciones/
│   │   └── incidencias/
│   │
│   ├── routes/
│   │   ├── entregas/
│   │   ├── asignaciones/
│   │   └── incidencias/
│   │
│   ├── services/
│   │   └── index.js
│   ├── middlewares/
│   │   └── index.js
│   ├── helpers/
│   │   └── index.js
│   └── config/
│       └── index.js
│
└── server.js                        # (por crear)
```

**⚠️ IMPORTANTE**: Los archivos `index.js` en cada subcarpeta ya existen pero están vacíos (solo tienen `module.exports = {};`). NO se han creado los modelos `.model.js` ni los controladores específicos todavía.

---

## 📖 LEE ESTOS DOCUMENTOS ANTES DE EMPEZAR

### 1. **OBLIGATORIO**: `context/EnunciadoLogistica.md`
Este es el **documento maestro**. Contiene:
- ✅ Responsabilidades del módulo (qué hace y qué NO hace)
- ✅ Estructura de datos completa (4 entidades principales)
- ✅ Flujos operativos detallados
- ✅ API REST completa con todos los endpoints
- ✅ Máquina de estados y validaciones
- ✅ Plan de implementación por fases

### 2. **IMPORTANTE**: `context/CONTEXTOMODELS.md`
Patrón de arquitectura de modelos Sequelize usado en el proyecto:
- ✅ Cómo estructurar archivos `.model.js`
- ✅ Cómo definir relaciones en el `index.js` central
- ✅ Convenciones de nomenclatura
- ✅ Ejemplos completos

### 3. **REFERENCIA**: `context/enunciadoprincipal.md`
Concepto original y justificación del módulo.

### 4. **REFERENCIA**: `context/EXTERNAL_APIS.md`
Ejemplos de APIs externas (de otros módulos como referencia).

---

## 🎯 TU MISIÓN: IMPLEMENTAR EL MÓDULO

### Fase Actual: **Fase 1 - Base de Datos y Modelos** ✅

**Objetivo**: Crear las 4 entidades principales con sus modelos Sequelize.

#### Entidades a crear:

1. **Entrega** (`src/models/entregas/entrega.model.js`)
   - Tabla: `Entregas`
   - Campos principales: ver `EnunciadoLogistica.md` → Sección "Estructura de Datos"
   - Estados: `pendiente`, `asignada`, `en_preparacion`, `lista_para_recoger`, `en_camino`, `entregada`, `cancelada`, `fallida`

2. **AsignacionEntrega** (`src/models/asignaciones/asignacion-entrega.model.js`)
   - Tabla: `AsignacionesEntrega`
   - Relación: FK a Entregas
   - Permite reasignaciones (múltiples registros por entrega)

3. **HistorialEstado** (`src/models/historial/historial-estado.model.js`)
   - Tabla: `HistorialEstados`
   - Relación: FK a Entregas
   - Auditoría completa de cambios de estado

4. **Incidencia** (`src/models/incidencias/incidencia.model.js`)
   - Tabla: `Incidencias`
   - Relación: FK a Entregas
   - Tipos: `cliente_no_responde`, `direccion_incorrecta`, `problema_comercio`, etc.

#### Pasos a seguir:

1. **Crear cada archivo `.model.js`**:
   - Usa `DataTypes` de Sequelize
   - Define campos según especificación en `EnunciadoLogistica.md`
   - Incluye `timestamps: true` con `created_at` y `updated_at`
   - Añade índices en campos clave
   - **NO definas relaciones aquí** (solo estructura)

2. **Actualizar `src/models/index.js`**:
   - Importar los 4 modelos
   - Definir relaciones entre ellos (hasMany, belongsTo)
   - Exportar todos los modelos

   Ejemplo de relaciones esperadas:
   ```javascript
   // Entrega → HistorialEstado (1:N)
   Entrega.hasMany(HistorialEstado, { foreignKey: 'id_entrega', as: 'historial' });
   HistorialEstado.belongsTo(Entrega, { foreignKey: 'id_entrega', as: 'entrega' });
   
   // Entrega → AsignacionEntrega (1:N)
   Entrega.hasMany(AsignacionEntrega, { foreignKey: 'id_entrega', as: 'asignaciones' });
   // ... etc.
   ```

3. **Probar la sincronización**:
   - Crear un script simple o usar el `server.js` para probar `sequelize.sync()`
   - Verificar que las tablas se crean correctamente en MySQL

---

## 🔧 GUÍA RÁPIDA DE IMPLEMENTACIÓN

### Convenciones a seguir:

#### Nomenclatura:
- **Archivos**: `kebab-case.model.js` → `entrega.model.js`
- **Clases**: `PascalCase` → `Entrega`
- **Tablas**: `PascalCase` plural → `Entregas`
- **Foreign Keys**: `snake_case` con prefijo `id_` → `id_entrega`
- **Timestamps**: `snake_case` → `created_at`, `updated_at`

#### Estructura de un modelo:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const Entrega = sequelize.define('Entrega', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    modulo_origen: {
        type: DataTypes.ENUM('restaurante', 'negocios'),
        allowNull: false
    },
    estado_actual: {
        type: DataTypes.ENUM(
            'pendiente', 
            'asignada', 
            'en_preparacion',
            'lista_para_recoger',
            'en_camino',
            'entregada',
            'cancelada',
            'fallida'
        ),
        defaultValue: 'pendiente',
        allowNull: false
    },
    // ... más campos
}, {
    tableName: 'Entregas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['modulo_origen'] },
        { fields: ['estado_actual'] },
        { fields: ['referencia_origen'] }
    ]
});

module.exports = Entrega;
```

---

## ✅ CRITERIOS DE ÉXITO - FASE 1

Una vez completada esta fase, deberías tener:

- [x] 4 archivos `.model.js` creados con estructura completa
- [x] `src/models/index.js` actualizado con importaciones y relaciones
- [x] Tablas sincronizadas en base de datos MySQL
- [x] Relaciones funcionando correctamente (puedes hacer queries con `include`)
- [x] Índices creados en campos clave

---

## 🚀 PRÓXIMAS FASES (NO IMPLEMENTAR TODAVÍA)

### Fase 2: Endpoints de Entregas
- CRUD básico de entregas
- Validaciones de entrada
- Integración con servicio de Administración

### Fase 3: Sistema de Estados
- Validador de transiciones
- Actualización de estado con historial automático

### Fase 4: Asignaciones
- Asignar/liberar repartidores
- Consulta de disponibilidad

### Fase 5: Incidencias
- CRUD de incidencias
- Flujo de resolución

---

## 📊 EJEMPLO DE QUERY ESPERADO AL FINALIZAR FASE 1

```javascript
const { Entrega, AsignacionEntrega, HistorialEstado, Incidencia } = require('./models');

// Obtener entrega con toda su información relacionada
const entrega = await Entrega.findByPk(1, {
    include: [
        {
            model: AsignacionEntrega,
            as: 'asignaciones',
            where: { estado_asignacion: 'activa' },
            required: false
        },
        {
            model: HistorialEstado,
            as: 'historial',
            order: [['fecha_cambio', 'DESC']]
        },
        {
            model: Incidencia,
            as: 'incidencias',
            required: false
        }
    ]
});
```

---

## 🆘 RECURSOS DE AYUDA

### Documentación técnica:
- **Sequelize**: https://sequelize.org/docs/v6/
- **Express**: https://expressjs.com/
- **MySQL Data Types**: https://dev.mysql.com/doc/refman/8.0/en/data-types.html

### Archivos de referencia en el proyecto:
- `services/restaurantes/src/models/` → Ver cómo están estructurados otros modelos
- `context/CONTEXTOMODELS.md` → Patrones y ejemplos completos

---

## 🎨 PROMPT SUGERIDO PARA CLAUDE CODE

```
Hola Claude, necesito que implementes la Fase 1 del módulo de Logística.

CONTEXTO:
- Lee completamente el archivo context/EnunciadoLogistica.md
- Lee el archivo context/CONTEXTOMODELS.md para entender el patrón de arquitectura
- La estructura de carpetas ya está creada

TAREAS:
1. Crear los 4 modelos Sequelize (.model.js):
   - Entrega (en src/models/entregas/)
   - AsignacionEntrega (en src/models/asignaciones/)
   - HistorialEstado (en src/models/historial/)
   - Incidencia (en src/models/incidencias/)

2. Actualizar src/models/index.js:
   - Importar los 4 modelos
   - Definir las relaciones entre ellos
   - Exportarlos

IMPORTANTE:
- Usa la especificación EXACTA de campos del EnunciadoLogistica.md
- Sigue el patrón de CONTEXTOMODELS.md (sin relaciones en modelos individuales)
- Usa nomenclatura snake_case para campos y timestamps
- Incluye índices en campos clave
- Usa ENUM para campos con valores fijos

Confirma cuando hayas leído los documentos y pregunta cualquier duda antes de empezar.
```

---

## 📝 NOTAS FINALES

- **No te saltes la lectura de `EnunciadoLogistica.md`**: Contiene TODO el diseño del módulo
- **Sigue el patrón establecido**: Revisa `CONTEXTOMODELS.md` para evitar errores de arquitectura
- **Pregunta antes de decidir**: Si algo no está claro en la especificación
- **Fases incrementales**: No intentes implementar todo de una vez

---

**Estado actual**: ✅ Estructura de carpetas creada, archivos index.js placeholder listos  
**Siguiente paso**: 🔨 Implementar modelos Sequelize  
**Prioridad**: 🔥 Alta - Base del módulo

---

**Versión**: 1.0  
**Fecha**: 2026-03-12  
**Autor**: Equipo de desarrollo
