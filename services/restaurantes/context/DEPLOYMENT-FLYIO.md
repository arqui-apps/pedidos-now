# Guía Completa de Despliegue en Fly.io con PostgreSQL (Neon)

**Fecha:** 27 de Marzo 2026  
**Proyecto:** Servicio de Restaurantes - Microservicio Node.js + Express + Sequelize  
**Stack:** Node.js 18, Express, Sequelize, PostgreSQL  
**Plataforma:** Fly.io  
**Base de Datos:** Neon.tech (PostgreSQL)

---

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
3. [Preparación del Código](#preparación-del-código)
4. [Configuración de Fly.io](#configuración-de-flyio)
5. [Deployment](#deployment)
6. [Verificación y Testing](#verificación-y-testing)
7. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)
8. [Checklist Final](#checklist-final)

---

## 📦 Prerequisitos

### 1. Herramientas Necesarias

```bash
# Instalar Fly.io CLI
curl -L https://fly.io/install.sh | sh

# Agregar al PATH (añadir a ~/.bashrc o ~/.zshrc)
export PATH="/home/$USER/.fly/bin:$PATH"

# Verificar instalación
flyctl version
```

### 2. Cuentas Requeridas

- ✅ Cuenta en [Fly.io](https://fly.io)
- ✅ Cuenta en [Neon.tech](https://neon.tech) (para PostgreSQL)
- ✅ Repositorio en GitHub

---

## 🗄️ Configuración de la Base de Datos

### Opción A: Neon.tech (PostgreSQL Serverless - Recomendado)

1. **Crear proyecto en Neon.tech:**
   - Ve a [console.neon.tech](https://console.neon.tech)
   - Create New Project
   - Selecciona región cercana a tu app de Fly.io
   - Copia el **DATABASE_URL** (Connection String)

2. **Connection String formato:**
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### Opción B: Fly.io PostgreSQL (Más control)

```bash
# Crear base de datos PostgreSQL en Fly.io
flyctl postgres create

# Attach a tu app
flyctl postgres attach <postgres-app-name> --app <your-app-name>
```

---

## 🔧 Preparación del Código

### 1. Migración de MySQL a PostgreSQL

**❌ Tipos NO compatibles (MySQL):**
```javascript
DataTypes.TINYINT      // No existe en PostgreSQL
DataTypes.DATETIME     // Usar TIMESTAMP o DATE
DataTypes.LONGTEXT     // Usar TEXT
DataTypes.MEDIUMTEXT   // Usar TEXT
DataTypes.DOUBLE       // Preferir DECIMAL
```

**✅ Tipos compatibles (PostgreSQL):**
```javascript
DataTypes.SMALLINT     // Reemplaza TINYINT
DataTypes.INTEGER
DataTypes.BIGINT
DataTypes.DECIMAL(10,2)
DataTypes.TEXT
DataTypes.STRING(255)
DataTypes.BOOLEAN
DataTypes.DATE
DataTypes.TIME
```

**Ejemplo de cambio en modelos:**

```javascript
// ANTES (MySQL)
dia_semana: {
  type: DataTypes.TINYINT,
  allowNull: false
}

// DESPUÉS (PostgreSQL)
dia_semana: {
  type: DataTypes.SMALLINT,
  allowNull: false
}
```

### 2. Configuración de Variables de Entorno

**Archivo: `src/config/env.js`**

```javascript
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // Database - PostgreSQL (usa DATABASE_URL para producción)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/dbname',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  
  // External Services
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  // ... otros servicios
};
```

### 3. Configuración de Sequelize para PostgreSQL

**Archivo: `src/config/database.js`**

```javascript
const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
```

### 4. ⚠️ **CRÍTICO**: Server debe escuchar en `0.0.0.0`

**Archivo: `server.js`**

```javascript
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Probar conexión a la BD
    await testConnection();
    
    // Sincronizar modelos solo en desarrollo
    if (env.NODE_ENV === 'production') {
      // En producción: NO sincronizar automáticamente (mejora performance)
      console.log('📦 Modo producción: Base de datos lista (sin sincronización automática).');
    } else {
      // En desarrollo: permite modificar estructura
      await sequelize.sync({ alter: true });
      console.log('📦 Modelos sincronizados (desarrollo: con alter).');
    }
    
    // ⚠️ CRÍTICO: Escuchar en 0.0.0.0 para que Fly.io pueda acceder
    const PORT = env.PORT;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en 0.0.0.0:${PORT}`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
```

**❌ ERROR COMÚN:**
```javascript
// ❌ MALO - Solo escucha en localhost
app.listen(PORT, () => { ... });

// ✅ BUENO - Escucha en todas las interfaces
app.listen(PORT, '0.0.0.0', () => { ... });
```

### 5. Dockerfile Optimizado

**Archivo: `Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 8080

# ⚠️ IMPORTANTE: Ejecutar server.js, NO syncDatabase.js
CMD ["node", "server.js"]
```

### 6. Configuración de package.json

**Archivo: `package.json`**

```json
{
  "name": "restaurantes-service",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.20.0",           // ⚠️ REQUERIDO para PostgreSQL
    "pg-hstore": "^2.3.4",     // ⚠️ REQUERIDO para PostgreSQL
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0"
  }
}
```

**⚠️ Asegúrate de instalar las dependencias de PostgreSQL:**

```bash
npm install pg pg-hstore --save
```

---

## 🚀 Configuración de Fly.io

### 1. Inicializar Proyecto

```bash
# Navegar a tu proyecto
cd /path/to/your/service

# Login en Fly.io
flyctl auth login

# Inicializar configuración (genera fly.toml)
flyctl launch
```

**Durante `flyctl launch`:**
- ❌ **NO** crear base de datos PostgreSQL (usaremos Neon)
- ✅ Confirmar región (usa la más cercana)
- ✅ Confirmar nombre de la app

### 2. Configuración de fly.toml

**Archivo: `fly.toml`**

```toml
app = 'restaurantes'
primary_region = 'iad'

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'off'        # ⚠️ Importante: Evita cold starts
  auto_start_machines = true
  min_machines_running = 1          # ⚠️ Mantiene 1 máquina siempre activa
  processes = ['app']

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
  memory_mb = 1024
```

**Puntos clave:**
- `internal_port = 8080` → Tu app debe escuchar en este puerto
- `auto_stop_machines = 'off'` → Evita que la máquina se detenga
- `min_machines_running = 1` → Mantiene al menos 1 activa (sin cold starts)

### 3. Configurar Variables de Entorno (Secrets)

```bash
# Variables de entorno críticas
flyctl secrets set NODE_ENV=production --app restaurantes
flyctl secrets set PORT=8080 --app restaurantes
flyctl secrets set DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" --app restaurantes
flyctl secrets set JWT_SECRET="tu_secreto_super_seguro_aqui" --app restaurantes

# Servicios externos (si aplica)
flyctl secrets set AUTH_SERVICE_URL="https://auth.tudominio.com" --app restaurantes
flyctl secrets set BROKER_SERVICE_URL="https://broker.tudominio.com" --app restaurantes

# Verificar secrets configurados
flyctl secrets list --app restaurantes
```

**⚠️ NUNCA** subas estos valores a Git:
- DATABASE_URL
- JWT_SECRET
- API Keys
- Passwords

---

## 🚢 Deployment

### Primera Vez (Sincronizar Base de Datos)

Si tu base de datos en Neon está vacía, necesitas sincronizar las tablas:

**Opción 1: Script de migración manual**

```bash
# Crear script temporal: sync-production.js
node syncDatabase.js
```

Asegúrate que `syncDatabase.js` use `{ alter: false }` o `{ force: false }` en producción.

**Opción 2: Desde tu máquina local**

```bash
# Conectarte a Neon y ejecutar SQL
DATABASE_URL="postgresql://..." node syncDatabase.js
```

### Despliegue Normal

```bash
# Commit tus cambios
git add .
git commit -m "feat: Configuración para Fly.io"
git push origin main

# Deploy a Fly.io
flyctl deploy

# O con build sin cache (si hay problemas)
flyctl deploy --no-cache
```

### Comandos Útiles Durante Deploy

```bash
# Ver logs en tiempo real
flyctl logs --app restaurantes

# Ver estado de las máquinas
flyctl status --app restaurantes

# Ver lista de máquinas
flyctl machines list --app restaurantes

# SSH a la máquina (debugging)
flyctl ssh console --app restaurantes

# Reiniciar máquina
flyctl machine restart <machine-id> --app restaurantes
```

---

## ✅ Verificación y Testing

### 1. Health Check

```bash
# Probar endpoint de salud
curl https://restaurantes.fly.dev/health

# Respuesta esperada:
# {"status":"OK","service":"restaurantes-service"}
```

### 2. Probar Endpoints de API

```bash
# Listar restaurantes
curl https://restaurantes.fly.dev/api/restaurantes

# Crear restaurante
curl -X POST https://restaurantes.fly.dev/api/restaurantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Restaurante",
    "direccion": "Calle 123",
    "telefono": "555-1234",
    "correo": "contacto@restaurante.com"
  }'

# Ver con formato JSON
curl -s https://restaurantes.fly.dev/api/restaurantes | jq .
```

### 3. Verificar Logs

```bash
# Ver logs recientes
flyctl logs --app restaurantes

# Buscar errores
flyctl logs --app restaurantes | grep -i error

# Verificar que esté escuchando en el puerto correcto
flyctl logs --app restaurantes | grep "Servidor corriendo"
```

**Salida esperada:**
```
🚀 Servidor corriendo en 0.0.0.0:8080
🌍 Ambiente: production
✅ Conexión a la base de datos establecida correctamente.
📦 Modo producción: Base de datos lista
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "instance refused connection. is your app listening on 0.0.0.0:8080?"

**Causa:** El servidor escucha en `localhost` o puerto incorrecto.

**Solución:**
```javascript
// ❌ MALO
app.listen(3000);

// ✅ BUENO
app.listen(process.env.PORT, '0.0.0.0', () => { ... });
```

**Verificar variable PORT:**
```bash
flyctl secrets set PORT=8080 --app restaurantes
```

---

### Problema 2: "type 'tinyint' does not exist"

**Causa:** PostgreSQL no tiene tipo `TINYINT` (es específico de MySQL).

**Solución:**
```javascript
// Cambiar en todos los modelos
dia_semana: {
  type: DataTypes.SMALLINT,  // ✅ Compatible con PostgreSQL
  allowNull: false
}
```

---

### Problema 3: La máquina se detiene constantemente (cold starts)

**Causa:** Configuración de `auto_stop_machines` activa.

**Solución en `fly.toml`:**
```toml
[http_service]
  auto_stop_machines = 'off'
  min_machines_running = 1
```

**O configurar máquina manualmente:**
```bash
flyctl machines update <machine-id> --autostart=true --autostop=false --app restaurantes
flyctl scale count 1 --app restaurantes
```

---

### Problema 4: Base de datos sincroniza en cada reinicio (lento)

**Causa:** `sequelize.sync()` se ejecuta en producción.

**Solución:**
```javascript
if (env.NODE_ENV === 'production') {
  // NO sincronizar automáticamente
  console.log('📦 Modo producción: Base de datos lista.');
} else {
  await sequelize.sync({ alter: true });
}
```

---

### Problema 5: "Error: connect ECONNREFUSED"

**Causa:** DATABASE_URL mal configurado o sin SSL.

**Solución:**
```javascript
const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,              // ⚠️ Obligatorio para Neon
      rejectUnauthorized: false
    }
  }
});
```

---

### Problema 6: "Cannot GET /api/productos" (404)

**Causa:** Ruta no registrada en `routes/index.js`.

**Solución:**
```javascript
// Verificar que la ruta esté importada y registrada
const productoRoutes = require('./productos/producto.routes');
router.use('/productos', productoRoutes);

// O si está anidada:
router.use('/restaurantes/:id/productos', productoRoutes);
```

---

### Problema 7: Build falla por falta de dependencias

**Causa:** `pg` o `pg-hstore` no instalados.

**Solución:**
```bash
npm install pg pg-hstore --save
git add package.json package-lock.json
git commit -m "Add PostgreSQL dependencies"
flyctl deploy
```

---

## 📝 Checklist Final

### Antes del Primer Deploy

- [ ] Instalar `pg` y `pg-hstore`
- [ ] Cambiar todos los tipos `TINYINT` a `SMALLINT`
- [ ] Configurar `dialect: 'postgres'` en database.js
- [ ] Server escucha en `0.0.0.0:PORT`
- [ ] `CMD ["node", "server.js"]` en Dockerfile
- [ ] `fly.toml` configurado correctamente
- [ ] Variables de entorno configuradas (secrets)
- [ ] `.env` en `.gitignore`

### Configuración de Fly.io

- [ ] `PORT=8080` configurado
- [ ] `NODE_ENV=production` configurado
- [ ] `DATABASE_URL` configurado con Neon
- [ ] `JWT_SECRET` configurado
- [ ] `auto_stop_machines = 'off'`
- [ ] `min_machines_running = 1`

### Después del Deploy

- [ ] Verificar logs: `flyctl logs`
- [ ] Probar health endpoint: `/health`
- [ ] Probar endpoints de API
- [ ] Verificar que la máquina esté `started`
- [ ] Crear datos de prueba
- [ ] Verificar tiempo de respuesta (sin cold starts)

---

## 🔧 Comandos de Mantenimiento

```bash
# Ver estado general
flyctl status --app restaurantes

# Ver logs en tiempo real
flyctl logs --app restaurantes

# Ver máquinas
flyctl machines list --app restaurantes

# Escalar recursos (CPU/RAM)
flyctl scale vm shared-cpu-2x --app restaurantes

# Escalar número de instancias
flyctl scale count 2 --app restaurantes

# Ver secrets configurados
flyctl secrets list --app restaurantes

# Actualizar secret
flyctl secrets set KEY=value --app restaurantes

# SSH a la máquina
flyctl ssh console --app restaurantes

# Ver uso de recursos
flyctl dashboard --app restaurantes
```

---

## 📊 Estructura de Archivos Clave

```
project/
├── Dockerfile                  # ⚠️ CMD ["node", "server.js"]
├── fly.toml                    # ⚠️ auto_stop_machines = 'off'
├── package.json                # ⚠️ Incluir pg y pg-hstore
├── server.js                   # ⚠️ app.listen(PORT, '0.0.0.0')
├── src/
│   ├── app.js                  # Express app
│   ├── config/
│   │   ├── database.js         # ⚠️ dialect: 'postgres', ssl: true
│   │   └── env.js              # ⚠️ DATABASE_URL
│   ├── models/                 # ⚠️ DataTypes compatibles con PostgreSQL
│   ├── controllers/
│   └── routes/
└── context/
    └── DEPLOYMENT-FLYIO.md     # Este archivo
```

---

## 🎯 Mejores Prácticas

### 1. Seguridad

- ✅ Usar `flyctl secrets` para datos sensibles
- ✅ Nunca hacer commit de `.env` con datos reales
- ✅ SSL/TLS habilitado para base de datos
- ✅ Validación de entrada en todos los endpoints
- ✅ Rate limiting (considerar para producción)

### 2. Performance

- ✅ `min_machines_running = 1` para evitar cold starts
- ✅ No sincronizar DB en cada arranque en producción
- ✅ Connection pooling configurado
- ✅ Logging solo en desarrollo
- ✅ Índices en columnas frecuentemente consultadas

### 3. Monitoreo

- ✅ Logs centralizados: `flyctl logs`
- ✅ Health check endpoint
- ✅ Alertas de error en producción
- ✅ Métricas de performance
- ✅ Dashboard de Fly.io

### 4. Base de Datos

- ✅ Backups automáticos en Neon
- ✅ Migraciones versionadas (Sequelize CLI)
- ✅ No usar `sync({ force: true })` nunca en producción
- ✅ Connection string con SSL
- ✅ Connection pool limitado

---

## 🔗 Referencias Útiles

- [Fly.io Docs](https://fly.io/docs/)
- [Neon Docs](https://neon.tech/docs)
- [Sequelize PostgreSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `flyctl logs --app restaurantes`
2. Verifica secretos: `flyctl secrets list --app restaurantes`
3. Consulta el status: `flyctl status --app restaurantes`
4. Revisa esta guía completa
5. Consulta documentación oficial de Fly.io

---

**Última actualización:** 27 de Marzo 2026  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo Pedidos-Now
