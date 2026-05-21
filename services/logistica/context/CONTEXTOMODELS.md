# CONTEXTO: ARQUITECTURA DE MODELOS SEQUELIZE

## 📋 DESCRIPCIÓN GENERAL

Este proyecto utiliza **Sequelize ORM** para gestionar la base de datos MySQL con una arquitectura modular y centralizada que separa la **definición de modelos** de la **configuración de relaciones**.
Aqui se plantea solamente de ejemplo, para poderlo mas adelante adaptarlo al proyecto principal. 

### Patrón de Diseño Implementado

**Modelo Centralizado con Separación de Responsabilidades:**
- **Modelos individuales**: Cada tabla tiene su propio archivo `.model.js` en una carpeta temática
- **Relaciones centralizadas**: Todas las asociaciones entre modelos se definen en un único archivo `index.js`
- **Exportación unificada**: Un solo punto de entrada para importar todos los modelos con sus relaciones ya configuradas

---

## 🏗️ ESTRUCTURA DE CARPETAS

```
src/models/
├── index.js                    # ⭐ ARCHIVO CENTRAL - Define todas las relaciones
├── auth/                       # Autenticación y roles
│   ├── rol.model.js
│   └── usuario.model.js
├── empresas/
│   └── empresa.model.js
├── candidatos/
│   └── candidato.model.js
├── vacantes/
│   ├── vacante.model.js
│   └── postulacion.model.js
├── pruebas-psicometricas/
│   ├── prueba.model.js
│   ├── pregunta.model.js
│   ├── opcion-respuesta.model.js
│   ├── asignacion-prueba.model.js
│   ├── respuesta-candidato.model.js
│   ├── resultado-prueba.model.js
│   └── evaluacion-psicometrica.model.js
├── pruebas-tecnicas/
│   └── prueba-tecnica.model.js
├── pruebas-medicas/
│   └── prueba-medica.model.js
├── entrevistas/
│   └── entrevista.model.js
├── eventos/
│   └── evento.model.js
├── documentos/
│   └── verificacion-documento.model.js
├── evaluaciones/
│   └── evaluacion-post-contratacion.model.js
├── contrataciones/
│   ├── contratacion.model.js
│   ├── evaluacion-periodo-prueba.model.js
│   └── empleado-planilla.model.js
└── admin/
    ├── historial-actividad.model.js
    └── reporte.model.js
```

---

## 📝 ANATOMÍA DE UN MODELO INDIVIDUAL

Cada archivo `.model.js` sigue esta estructura estándar:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');  // Conexión a la BD

const NombreModelo = sequelize.define('NombreModelo', {
    // DEFINICIÓN DE CAMPOS
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    campo_ejemplo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    // ... más campos
}, {
    // CONFIGURACIÓN DE LA TABLA
    tableName: 'NombreTabla',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['campo_indice'] }
    ],
    comment: 'Descripción de la tabla'
});

module.exports = NombreModelo;  // ⚠️ NO se definen relaciones aquí
```

### Características Clave:
1. **Sin relaciones**: Los modelos individuales NO definen `hasMany`, `belongsTo`, etc.
2. **Solo estructura**: Únicamente definen campos, tipos de datos, validaciones e índices
3. **Referencias declarativas**: Incluyen `references` en las llaves foráneas pero no crean las asociaciones
4. **Exportación limpia**: Cada modelo se exporta inmediatamente sin configuración adicional

---

## ⭐ EL ARCHIVO CENTRAL: `index.js`

Este es el **corazón de la arquitectura de modelos**. Tiene tres secciones principales:

### 1️⃣ IMPORTACIÓN DE MODELOS

```javascript
// Importar la instancia de Sequelize
const sequelize = require('../../db/db');

// Importar todos los modelos
const Rol = require('./auth/rol.model');
const Usuario = require('./auth/usuario.model');
const Empresa = require('./empresas/empresa.model');
const Candidato = require('./candidatos/candidato.model');
// ... todos los demás modelos
```

**Todos los modelos se importan al inicio del archivo.**

### 2️⃣ DEFINICIÓN DE RELACIONES (ASSOCIATIONS)

Esta es la sección más importante. Aquí se definen **todas las relaciones** entre modelos organizadas por módulo funcional:

```javascript
// ==================== MÓDULO: AUTENTICACIÓN ====================

// Rol <-> Usuario (1:N)
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

// ==================== MÓDULO: EMPRESAS ====================

// Usuario <-> Empresa (1:1)
Usuario.hasOne(Empresa, { foreignKey: 'id_usuario', as: 'empresa' });
Empresa.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// ==================== MÓDULO: VACANTES ====================

// Empresa <-> Vacante (1:N)
Empresa.hasMany(Vacante, { foreignKey: 'id_empresa', as: 'vacantes' });
Vacante.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });

// ... y así sucesivamente para todos los módulos
```

#### Tipos de Relaciones Implementadas:

| Relación | Método Sequelize | Ejemplo |
|----------|------------------|---------|
| **Uno a Muchos (1:N)** | `hasMany` / `belongsTo` | Empresa → Vacantes |
| **Uno a Uno (1:1)** | `hasOne` / `belongsTo` | Usuario ↔ Empresa |
| **Muchos a Muchos (N:M)** | Tabla intermedia explícita | Candidato ↔ Vacante (a través de Postulacion) |

#### Nomenclatura de Alias (`as`):

- **Singular**: Para relaciones `belongsTo` o `hasOne` → `as: 'candidato'`, `as: 'empresa'`
- **Plural**: Para relaciones `hasMany` → `as: 'vacantes'`, `as: 'usuarios'`
- **Descriptivos**: Cuando hay múltiples relaciones al mismo modelo → `as: 'pruebas_creadas'`, `as: 'evaluador'`

### 3️⃣ EXPORTACIÓN UNIFICADA

```javascript
module.exports = {
    sequelize,
    
    // Auth
    Rol,
    Usuario,
    
    // Empresas y Candidatos
    Empresa,
    Candidato,
    
    // ... todos los modelos organizados por módulo
};
```

**Todos los modelos se exportan desde un solo lugar**, facilitando su importación en controladores y servicios.

---

## 🔄 FLUJO DE TRABAJO

### Paso 1: Crear un Nuevo Modelo

Crear el archivo en la carpeta correspondiente (ejemplo: `src/models/nueva-carpeta/nuevo-modelo.model.js`):

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');  // Ajustar la ruta según profundidad

const NuevoModelo = sequelize.define('NuevoModelo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    id_referencia: {  // Llave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuarios',  // Nombre de la tabla
            key: 'id'
        }
    }
    // ... más campos
}, {
    tableName: 'NuevoModelos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['id_referencia'] }
    ]
});

module.exports = NuevoModelo;
```

### Paso 2: Registrar en `index.js`

#### 2.1 Importar el modelo:
```javascript
// En la sección de importaciones
const NuevoModelo = require('./nueva-carpeta/nuevo-modelo.model');
```

#### 2.2 Definir relaciones:
```javascript
// En la sección de relaciones (agregar nuevo módulo si es necesario)
// ==================== MÓDULO: NUEVA FUNCIONALIDAD ====================

// Usuario <-> NuevoModelo (1:N)
Usuario.hasMany(NuevoModelo, { foreignKey: 'id_referencia', as: 'nuevos_modelos' });
NuevoModelo.belongsTo(Usuario, { foreignKey: 'id_referencia', as: 'usuario' });
```

#### 2.3 Exportar el modelo:
```javascript
// En la sección de exportación
module.exports = {
    sequelize,
    // ... otros modelos
    NuevoModelo,  // Agregar aquí
};
```

### Paso 3: Usar en Controladores

```javascript
// Importar desde el index centralizado
const { NuevoModelo, Usuario, Empresa } = require('../../models');

// Usar con includes para hacer joins
const resultado = await NuevoModelo.findAll({
    include: [
        {
            model: Usuario,
            as: 'usuario',  // ⚠️ Usar el mismo alias definido en index.js
            attributes: ['id', 'nombre', 'email']
        }
    ]
});
```

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### ✅ Organización Modular
- Cada modelo está aislado en su propia carpeta temática
- Fácil localización de archivos por funcionalidad (auth, vacantes, pruebas, etc.)
- Escalabilidad: agregar nuevos módulos sin afectar existentes

### ✅ Separación de Responsabilidades
- **Modelos**: Solo definen estructura de datos y validaciones
- **Index.js**: Maneja toda la lógica de relaciones
- **Controladores**: Consumen modelos ya relacionados

### ✅ Mantenibilidad
- Un solo archivo para visualizar todas las relaciones del sistema
- Evita duplicación de asociaciones
- Comentarios descriptivos agrupados por módulo funcional

### ✅ Evita Dependencias Circulares
- Los modelos no se importan entre sí
- Las relaciones se definen después de que todos los modelos están cargados
- Secuencia clara: Importar → Relacionar → Exportar

### ✅ Importación Simplificada
```javascript
// ❌ ANTES (sin index.js centralizado)
const Usuario = require('../models/auth/usuario.model');
const Empresa = require('../models/empresas/empresa.model');
const Candidato = require('../models/candidatos/candidato.model');

// ✅ AHORA (con index.js centralizado)
const { Usuario, Empresa, Candidato } = require('../models');
```

---

## 📊 ORGANIZACIÓN DE MÓDULOS

Los modelos están agrupados en **13 módulos funcionales**:

1. **Auth** (`auth/`): Roles y usuarios del sistema
2. **Empresas** (`empresas/`): Perfil de empresas reclutadoras
3. **Candidatos** (`candidatos/`): Perfil de candidatos
4. **Vacantes** (`vacantes/`): Ofertas de trabajo y postulaciones
5. **Pruebas Psicométricas** (`pruebas-psicometricas/`): Sistema completo de evaluaciones (7 tablas)
6. **Pruebas Técnicas** (`pruebas-tecnicas/`): Evaluaciones técnicas
7. **Pruebas Médicas** (`pruebas-medicas/`): Exámenes médicos
8. **Entrevistas** (`entrevistas/`): Gestión de entrevistas
9. **Eventos** (`eventos/`): Calendario y seguimiento
10. **Documentos** (`documentos/`): Verificación documental
11. **Evaluaciones** (`evaluaciones/`): Evaluaciones post-contratación
12. **Contrataciones** (`contrataciones/`): Gestión de empleados (3 tablas)
13. **Admin** (`admin/`): Auditoría y reportes

---

## 🔗 PATRONES DE RELACIONES COMUNES

### Patrón 1: Usuario Polimórfico
El modelo `Usuario` se relaciona con múltiples entidades según el rol:

```javascript
// Relación 1:1 con Empresa (si es rol 'empresa')
Usuario.hasOne(Empresa, { foreignKey: 'id_usuario', as: 'empresa' });

// Relación 1:1 con Candidato (si es rol 'candidato')
Usuario.hasOne(Candidato, { foreignKey: 'id_usuario', as: 'candidato' });

// Usuario como "actor" en diferentes contextos
Usuario.hasMany(Entrevista, { foreignKey: 'entrevistador_id', as: 'entrevistas_realizadas' });
Usuario.hasMany(PruebaTecnica, { foreignKey: 'evaluador_id', as: 'pruebas_tecnicas_evaluadas' });
```

### Patrón 2: Postulación como Eje Central
`Postulacion` conecta múltiples procesos de selección:

```javascript
Postulacion.hasMany(Entrevista, { foreignKey: 'id_postulacion', as: 'entrevistas' });
Postulacion.hasMany(PruebaMedica, { foreignKey: 'id_postulacion', as: 'pruebas_medicas' });
Postulacion.hasMany(PruebaTecnica, { foreignKey: 'id_postulacion', as: 'pruebas_tecnicas' });
Postulacion.hasOne(Contratacion, { foreignKey: 'id_postulacion', as: 'contratacion' });
```

### Patrón 3: Relaciones Indirectas Documentadas
Cuando una relación es indirecta, se comenta para claridad:

```javascript
// COMENTADO: PruebaTecnica no tiene id_empresa directamente
// Se relaciona con Empresa a través de Vacante
// Empresa.hasMany(PruebaTecnica, { foreignKey: 'id_empresa', as: 'pruebas_tecnicas' });
```

### Patrón 4: Alias Descriptivos para Múltiples Roles
Cuando un modelo se relaciona múltiples veces con otro:

```javascript
// Usuario como creador
Usuario.hasMany(Prueba, { foreignKey: 'creador_id', as: 'pruebas_creadas' });
Prueba.belongsTo(Usuario, { foreignKey: 'creador_id', as: 'creador' });

// Usuario como evaluador
Usuario.hasMany(EvaluacionPsicometrica, { foreignKey: 'id_evaluador', as: 'evaluaciones_realizadas' });
EvaluacionPsicometrica.belongsTo(Usuario, { foreignKey: 'id_evaluador', as: 'evaluador' });

// Usuario como supervisor
Usuario.hasMany(Contratacion, { foreignKey: 'id_supervisor', as: 'supervisados' });
Contratacion.belongsTo(Usuario, { foreignKey: 'id_supervisor', as: 'supervisor' });
```

---

## 🛠️ CONVENCIONES Y BUENAS PRÁCTICAS

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| **Archivo modelo** | `kebab-case.model.js` | `evaluacion-periodo-prueba.model.js` |
| **Clase modelo** | `PascalCase` | `EvaluacionPeriodoPrueba` |
| **Tabla en BD** | `PascalCase` plural | `EvaluacionesPeriodoPrueba` |
| **Carpetas** | `kebab-case` plural | `pruebas-psicometricas/` |
| **Foreign Keys** | `snake_case` con prefijo `id_` | `id_candidato`, `id_empresa` |
| **Campos especiales** | `snake_case` descriptivo | `creador_id`, `evaluador_id`, `organizador_id` |
| **Alias relaciones** | `snake_case` descriptivo | `pruebas_creadas`, `entrevistas_realizadas` |

### Configuración de Timestamps

```javascript
{
    timestamps: true,
    createdAt: 'created_at',    // ⚠️ Usar snake_case para los campos
    updatedAt: 'updated_at'      // ⚠️ NO camelCase
}
```

### Índices Estratégicos

Cada modelo define índices para:
- **Llaves foráneas**: Para optimizar JOINs
- **Campos de búsqueda**: Estado, fechas, ubicación
- **Campos únicos**: Email, identificadores

```javascript
indexes: [
    { fields: ['id_empresa'] },      // FK
    { fields: ['estado'] },          // Filtros comunes
    { fields: ['fecha_publicacion'] } // Ordenamiento
]
```

---

## 🔍 TIPOS DE RELACIONES DETALLADAS

### Relaciones 1:1 (One-to-One)

```javascript
// Usuario tiene una Empresa
Usuario.hasOne(Empresa, { foreignKey: 'id_usuario', as: 'empresa' });
Empresa.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// AsignacionPrueba tiene un ResultadoPrueba
AsignacionPrueba.hasOne(ResultadoPrueba, { foreignKey: 'id_asignacion', as: 'resultado' });
ResultadoPrueba.belongsTo(AsignacionPrueba, { foreignKey: 'id_asignacion', as: 'asignacion' });
```

**Características:**
- La FK está en el modelo "hijo" (Empresa, ResultadoPrueba)
- `hasOne` en el modelo "padre"
- `belongsTo` en el modelo "hijo"
- Alias en singular

### Relaciones 1:N (One-to-Many)

```javascript
// Empresa tiene muchas Vacantes
Empresa.hasMany(Vacante, { foreignKey: 'id_empresa', as: 'vacantes' });
Vacante.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });

// Vacante tiene muchas Postulaciones
Vacante.hasMany(Postulacion, { foreignKey: 'id_vacante', as: 'postulaciones' });
Postulacion.belongsTo(Vacante, { foreignKey: 'id_vacante', as: 'vacante' });
```

**Características:**
- La FK está en el modelo "muchos" (Vacante, Postulacion)
- `hasMany` usa alias plural → `as: 'postulaciones'`
- `belongsTo` usa alias singular → `as: 'vacante'`

### Relaciones Complejas (Encadenadas)

```javascript
// Sistema de Pruebas Psicométricas (relación en cadena)
Prueba.hasMany(Pregunta, { foreignKey: 'id_prueba', as: 'preguntas' });
Pregunta.hasMany(OpcionRespuesta, { foreignKey: 'id_pregunta', as: 'opciones' });
AsignacionPrueba.hasMany(RespuestaCandidato, { foreignKey: 'id_asignacion', as: 'respuestas' });
RespuestaCandidato.belongsTo(OpcionRespuesta, { foreignKey: 'id_opcion_seleccionada', as: 'opcion_seleccionada' });
```

---

## 📚 EJEMPLO COMPLETO: MÓDULO DE PRUEBAS PSICOMÉTRICAS

Este módulo demuestra la complejidad manejada por la arquitectura:

```javascript
// 7 modelos interrelacionados:

// 1. Prueba (catálogo de pruebas)
Usuario.hasMany(Prueba, { foreignKey: 'creador_id', as: 'pruebas_creadas' });

// 2. Pregunta (pertenece a una Prueba)
Prueba.hasMany(Pregunta, { foreignKey: 'id_prueba', as: 'preguntas' });

// 3. OpcionRespuesta (opciones de cada Pregunta)
Pregunta.hasMany(OpcionRespuesta, { foreignKey: 'id_pregunta', as: 'opciones' });

// 4. AsignacionPrueba (asignar prueba a candidato)
Candidato.hasMany(AsignacionPrueba, { foreignKey: 'id_candidato', as: 'asignaciones_prueba' });
Prueba.hasMany(AsignacionPrueba, { foreignKey: 'id_prueba', as: 'asignaciones' });
Vacante.hasMany(AsignacionPrueba, { foreignKey: 'id_vacante', as: 'asignaciones_prueba' });

// 5. RespuestaCandidato (respuestas del candidato)
AsignacionPrueba.hasMany(RespuestaCandidato, { foreignKey: 'id_asignacion', as: 'respuestas' });
OpcionRespuesta.hasMany(RespuestaCandidato, { foreignKey: 'id_opcion_seleccionada', as: 'respuestas_candidatos' });

// 6. ResultadoPrueba (calificación final)
AsignacionPrueba.hasOne(ResultadoPrueba, { foreignKey: 'id_asignacion', as: 'resultado' });

// 7. EvaluacionPsicometrica (interpretación profesional)
AsignacionPrueba.hasOne(EvaluacionPsicometrica, { foreignKey: 'id_asignacion', as: 'evaluacion' });
Usuario.hasMany(EvaluacionPsicometrica, { foreignKey: 'id_evaluador', as: 'evaluaciones_realizadas' });
```

**Query ejemplo con todas las relaciones:**

```javascript
const asignacion = await AsignacionPrueba.findByPk(id, {
    include: [
        {
            model: Prueba,
            as: 'prueba',
            include: [{ model: Pregunta, as: 'preguntas' }]
        },
        { model: Candidato, as: 'candidato' },
        { model: Vacante, as: 'vacante' },
        { 
            model: RespuestaCandidato, 
            as: 'respuestas',
            include: [{ model: OpcionRespuesta, as: 'opcion_seleccionada' }]
        },
        { model: ResultadoPrueba, as: 'resultado' },
        { model: EvaluacionPsicometrica, as: 'evaluacion' }
    ]
});
```

---

## ⚠️ REGLAS IMPORTANTES

### 1. NO Definir Relaciones en Modelos Individuales
```javascript
// ❌ INCORRECTO (en usuario.model.js)
Usuario.hasOne(Empresa, { foreignKey: 'id_usuario' });

// ✅ CORRECTO
// Dejar el modelo limpio, sin relaciones
module.exports = Usuario;
```

### 2. Siempre Usar Alias Consistentes
```javascript
// ❌ INCORRECTO
Empresa.hasMany(Vacante, { foreignKey: 'id_empresa' });  // Sin alias

// ✅ CORRECTO
Empresa.hasMany(Vacante, { foreignKey: 'id_empresa', as: 'vacantes' });
// Luego usar: include: [{ model: Vacante, as: 'vacantes' }]
```

### 3. Mantener el Orden: Importar → Relacionar → Exportar
El `index.js` debe seguir siempre esta estructura:
1. Importar sequelize
2. Importar todos los modelos
3. Definir todas las relaciones (agrupadas por módulo)
4. Exportar todo

### 4. Documentar Relaciones Complejas
```javascript
// ==================== MÓDULO: PRUEBAS TÉCNICAS ====================

// Candidato <-> PruebaTecnica (1:N)
Candidato.hasMany(PruebaTecnica, { foreignKey: 'id_candidato', as: 'pruebas_tecnicas' });
PruebaTecnica.belongsTo(Candidato, { foreignKey: 'id_candidato', as: 'candidato' });

// NOTA: PruebaTecnica se relaciona con Empresa indirectamente a través de Vacante
```

### 5. Referencias en Modelos vs Asociaciones en Index
```javascript
// En el modelo individual (solo declarativo)
id_usuario: {
    type: DataTypes.INTEGER,
    references: {
        model: 'Usuarios',  // Nombre de tabla como string
        key: 'id'
    }
}

// En index.js (crea la asociación real)
Usuario.hasOne(Empresa, { foreignKey: 'id_usuario', as: 'empresa' });
Empresa.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
```

---

## 🚀 GUÍA RÁPIDA PARA IA

### Para Crear un Nuevo Modelo:

1. **Identificar el módulo funcional** al que pertenece
2. **Crear carpeta** (si no existe): `src/models/nombre-modulo/`
3. **Crear archivo modelo**: `nombre-modelo.model.js`
4. **Definir estructura** (campos, validaciones, índices) - **SIN relaciones**
5. **Actualizar `index.js`**:
   - Importar el modelo
   - Agregar relaciones en la sección correspondiente
   - Exportar el modelo
6. **Usar en controladores** importando desde `require('../models')`

### Para Modificar Relaciones:

1. **NO tocar** los archivos `.model.js` individuales
2. **Ir directamente** a `src/models/index.js`
3. **Localizar el módulo** funcional correspondiente
4. **Agregar/modificar** las asociaciones
5. **Verificar alias** para mantener consistencia

### Para Consultas con JOINs:

1. **Importar modelos** desde el índice central
2. **Usar includes** con el **mismo alias** definido en `index.js`
3. **Encadenar includes** para relaciones anidadas
4. **Especificar attributes** para optimizar queries

---

## 📖 EJEMPLO PRÁCTICO COMPLETO

### Escenario: Agregar modelo "Certificacion" para candidatos

#### 1. Crear el modelo
**Archivo**: `src/models/candidatos/certificacion.model.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const Certificacion = sequelize.define('Certificacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_candidato: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Candidatos',
            key: 'id'
        }
    },
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    institucion: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    fecha_obtencion: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    fecha_expiracion: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    url_credencial: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'Certificaciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['id_candidato'] }
    ]
});

module.exports = Certificacion;
```

#### 2. Actualizar `index.js`

```javascript
// ============================================================
// IMPORTAR TODOS LOS MODELOS
// ============================================================

// ... importaciones existentes

// Empresas y Candidatos
const Empresa = require('./empresas/empresa.model');
const Candidato = require('./candidatos/candidato.model');
const Certificacion = require('./candidatos/certificacion.model');  // ✅ AGREGAR

// ============================================================
// DEFINIR RELACIONES (ASSOCIATIONS)
// ============================================================

// ... relaciones existentes

// ==================== MÓDULO: CANDIDATOS ====================

// Usuario <-> Candidato (1:1)
Usuario.hasOne(Candidato, { foreignKey: 'id_usuario', as: 'candidato' });
Candidato.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Candidato <-> Certificacion (1:N)  // ✅ AGREGAR
Candidato.hasMany(Certificacion, { foreignKey: 'id_candidato', as: 'certificaciones' });
Certificacion.belongsTo(Candidato, { foreignKey: 'id_candidato', as: 'candidato' });

// ============================================================
// EXPORTAR SEQUELIZE Y TODOS LOS MODELOS
// ============================================================

module.exports = {
    sequelize,
    
    // ... exportaciones existentes
    Candidato,
    Certificacion,  // ✅ AGREGAR
};
```

#### 3. Usar en controladores

```javascript
const { Certificacion, Candidato } = require('../../models');

// Obtener candidato con certificaciones
const candidato = await Candidato.findByPk(id, {
    include: [
        {
            model: Certificacion,
            as: 'certificaciones',  // Usar el alias definido en index.js
            order: [['fecha_obtencion', 'DESC']]
        }
    ]
});
```

---

## 🎓 RESUMEN PARA IA

**Este proyecto usa un patrón de "Index Centralizado" para Sequelize donde:**

1. **Cada modelo vive en su propia carpeta temática** y solo define su estructura de datos
2. **NO se definen relaciones dentro de los modelos individuales**
3. **Un archivo `index.js` central** importa todos los modelos, define todas las relaciones y exporta todo
4. **Las relaciones están agrupadas por módulos funcionales** con comentarios descriptivos
5. **Los controladores importan modelos desde el índice central** usando destructuring
6. **Los alias son críticos** - deben ser consistentes entre definición y uso
7. **Las relaciones bidireccionales** siempre se definen en pares (hasMany/belongsTo, hasOne/belongsTo)

**Al trabajar con modelos:**
- ✅ **CREAR/MODIFICAR** archivos `.model.js` individuales para estructura de datos
- ✅ **ACTUALIZAR** `index.js` para relaciones y exportaciones
- ✅ **IMPORTAR** siempre desde `require('../models')` o `require('../../models')`
- ❌ **NO** definir asociaciones en archivos `.model.js` individuales
- ❌ **NO** importar modelos directamente desde sus archivos individuales en producción

Este patrón evita dependencias circulares, mantiene el código organizado y facilita el mantenimiento a largo plazo.

---

## 📁 ESTRUCTURA DE UN MÓDULO COMPLETO

Ejemplo real del módulo `contrataciones/`:

```
contrataciones/
├── contratacion.model.js           # Modelo principal
├── evaluacion-periodo-prueba.model.js
└── empleado-planilla.model.js

En index.js:
- Contratacion relaciona con: Empresa, Candidato, Postulacion, Vacante, Usuario (supervisor)
- EvaluacionPeriodoPrueba relaciona con: Contratacion, Usuario (evaluador)
- EmpleadoPlanilla relaciona con: Contratacion (1:1)
```

Cada módulo es **autocontenido** pero **interconectado** a través del `index.js` central.

---

**Última actualización**: 2026-03-03  
**Versión del patrón**: 1.0  
**ORM**: Sequelize v6+  
**Base de datos**: MySQL
