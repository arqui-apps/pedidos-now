# 🚀 INICIO RÁPIDO - MÓDULO DE LOGÍSTICA

## 📋 Pre-requisitos

1. ✅ MySQL instalado y corriendo
2. ✅ Node.js instalado (v14+)
3. ✅ Usuario MySQL con permisos para crear bases de datos

---

## ⚡ OPCIÓN 1: Inicialización Automática (Recomendado)

### Paso 1: Configurar variables de entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

Ejemplo de `.env`:
```env
DB_NAME=modulo_logistica_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
NODE_ENV=development
```

### Paso 2: Ejecutar inicialización

```bash
# Este script hará TODO automáticamente:
# - Crea la base de datos si no existe
# - Conecta a la base de datos
# - Crea todas las tablas
node init-db.js
```

**Output esperado:**
```
╔═══════════════════════════════════════════════════════════╗
║     INICIALIZACIÓN DE BASE DE DATOS - LOGÍSTICA          ║
╚═══════════════════════════════════════════════════════════╝

🔧 [LOGÍSTICA] Iniciando configuración de base de datos...

✅ [LOGÍSTICA] Base de datos 'modulo_logistica_db' verificada/creada correctamente.
✅ [LOGÍSTICA] Conexión a la base de datos establecida correctamente.

🔄 [LOGÍSTICA] Sincronizando modelos...
✅ [LOGÍSTICA] Modelos sincronizados con la base de datos.

✅ [LOGÍSTICA] Base de datos inicializada correctamente.

╔═══════════════════════════════════════════════════════════╗
║              ✅ INICIALIZACIÓN COMPLETADA                 ║
╚═══════════════════════════════════════════════════════════╝
```

### Paso 3: (Opcional) Verificar con el script de prueba

```bash
node test-models.js
```

---

## 🛠️ OPCIÓN 2: Proceso Manual

### Paso 1: Crear base de datos manualmente

```sql
CREATE DATABASE modulo_logistica_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE modulo_logistica_db;
```

### Paso 2: Ejecutar el SQL

```bash
mysql -u root -p modulo_logistica_db < db/logistica.sql
```

### Paso 3: Configurar .env

```bash
cp .env.example .env
# Editar con tus credenciales
```

### Paso 4: Probar

```bash
node test-models.js
```

---

## 🔧 FUNCIONES DISPONIBLES EN db.js

```javascript
const { 
    sequelize,                      // Instancia de Sequelize
    testConnection,                 // Probar conexión
    syncDatabase,                   // Sincronizar modelos
    createDatabaseIfNotExists,      // Crear BD si no existe
    initDatabase                    // Inicializar todo
} = require('./db/db');
```

### Uso en tu código:

```javascript
// Inicializar en tu aplicación
const { initDatabase } = require('./db/db');

async function startApp() {
    await initDatabase({ alter: true });
    // ... resto de tu código
}
```

---

## 📊 SINCRONIZACIÓN DE MODELOS

### Opciones de sincronización:

```javascript
// 1. ALTER (Recomendado para desarrollo)
// Ajusta las tablas sin borrar datos
await syncDatabase({ alter: true });

// 2. FORCE (⚠️ BORRA TODOS LOS DATOS)
// Recrea todas las tablas desde cero
await syncDatabase({ force: true });

// 3. NORMAL (Solo crea tablas nuevas)
// No modifica tablas existentes
await syncDatabase();
```

---

## ❓ SOLUCIÓN DE PROBLEMAS

### Error: "Access denied for user"

**Solución**: Verifica usuario y contraseña en `.env`

```bash
# Probar conexión manual
mysql -u root -p
```

### Error: "Can't connect to MySQL server"

**Solución**: Verifica que MySQL esté corriendo

```bash
# Linux/Mac
sudo service mysql status

# Windows
net start MySQL
```

### Error: "Database already exists"

**Solución**: No hay problema, el script usa `CREATE DATABASE IF NOT EXISTS`

### Error: "Table already exists"

**Solución**: Usa `{ alter: true }` en lugar de `{ force: true }`

```bash
# Editar init-db.js línea 28:
const success = await initDatabase({ alter: true });
```

---

## 🔐 PERMISOS DE USUARIO

Si tu usuario MySQL no tiene permisos para crear bases de datos:

```sql
-- Conectar como root
mysql -u root -p

-- Dar permisos
GRANT ALL PRIVILEGES ON *.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

O crear la BD manualmente y solo usar la sincronización.

---

## 📚 SCRIPTS DISPONIBLES

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Inicialización** | `node init-db.js` | Crea BD y tablas automáticamente |
| **Prueba completa** | `node test-models.js` | Prueba modelos y relaciones |
| **Manual** | `mysql < db/logistica.sql` | Ejecutar SQL manualmente |

---

## ✅ VERIFICACIÓN

Después de inicializar, verifica en MySQL:

```sql
-- Ver bases de datos
SHOW DATABASES;

-- Seleccionar BD
USE modulo_logistica_db;

-- Ver tablas creadas
SHOW TABLES;

-- Debería mostrar:
-- +------------------------------------------+
-- | Tables_in_modulo_logistica_db            |
-- +------------------------------------------+
-- | asignaciones_entrega                     |
-- | entregas                                 |
-- | estados_operativos_repartidor            |
-- | historial_estados_entrega                |
-- | incidencias_entrega                      |
-- | repartidores                             |
-- +------------------------------------------+

-- Ver estructura de una tabla
DESCRIBE entregas;
```

---

## 🎯 SIGUIENTE PASO

Una vez la base de datos esté inicializada, ya puedes:

1. ✅ Usar los modelos en tu código
2. ✅ Crear controladores
3. ✅ Implementar endpoints

Ver: `context/MODELOS_CREADOS.md` para ejemplos de uso.

---

**Fecha**: 2026-03-12  
**Estado**: ✅ Auto-creación de BD implementada
