# 🚂 Despliegue en Railway - Módulo Logística

## 📋 Pre-requisitos

1. Cuenta en Railway (https://railway.app)
2. GitHub conectado a Railway
3. Repositorio subido a GitHub

## 🚀 Pasos para Desplegar

### 1. Crear Nuevo Proyecto en Railway

```
1. Ir a https://railway.app/dashboard
2. Click en "New Project"
3. Seleccionar "Deploy from GitHub repo"
4. Elegir el repositorio: pedidos-now-logistica
```

### 2. Agregar Servicio PostgreSQL

```
1. En el proyecto, click en "+ New"
2. Seleccionar "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. Esperar a que se complete la creación
```

### 3. Configurar el Servicio de Logística

```
1. Click en "+ New" → "GitHub Repo"
2. Seleccionar el repositorio
3. En "Root Directory" poner: services/logistica
4. Railway detectará automáticamente el Dockerfile
```

### 4. Variables de Entorno

Railway conectará automáticamente las variables de PostgreSQL, pero debes configurar:

#### Variables Requeridas:
```bash
NODE_ENV=production
PORT=3005
```

#### Variables de PostgreSQL (Auto-conectadas):
Railway las provee automáticamente cuando vinculas el servicio PostgreSQL:
- `PGHOST` → usar como `DB_HOST`
- `PGPORT` → usar como `DB_PORT`
- `PGDATABASE` → usar como `DB_NAME`
- `PGUSER` → usar como `DB_USER`
- `PGPASSWORD` → usar como `DB_PASSWORD`

#### Configurar en Railway:
```
1. Click en el servicio "logistica"
2. Ir a pestaña "Variables"
3. Click en "New Variable"
4. Agregar las siguientes variables referenciando PostgreSQL:
   - DB_HOST=${{Postgres.PGHOST}}
   - DB_PORT=${{Postgres.PGPORT}}
   - DB_NAME=${{Postgres.PGDATABASE}}
   - DB_USER=${{Postgres.PGUSER}}
   - DB_PASSWORD=${{Postgres.PGPASSWORD}}
   - NODE_ENV=production
   - PORT=3005
```

### 5. Conectar Servicios

```
1. En el servicio "logistica"
2. Ir a "Settings" → "Service"
3. En "Connect to Services" seleccionar el servicio PostgreSQL
4. Railway establecerá la conexión automática
```

### 6. Desplegar

```
1. Railway desplegará automáticamente al detectar cambios
2. O hacer click en "Deploy" manualmente
3. Verificar logs en la pestaña "Deployments"
```

## 🔍 Verificar Despliegue

### 1. Ver Logs
```
- Click en el servicio
- Pestaña "Deployments"
- Ver logs en tiempo real
```

### 2. Probar Endpoints
```bash
# Health check
curl https://tu-servicio.railway.app/health

# Root endpoint
curl https://tu-servicio.railway.app/
```

### 3. Verificar Base de Datos
El script `syncDatabase.js` se ejecuta automáticamente al iniciar:
- Crea todas las tablas
- Inserta datos iniciales (categorías)
- Configura relaciones

## 📊 Estructura de Base de Datos

### Tablas Creadas Automáticamente:
- ✅ categorias_orden
- ✅ repartidores
- ✅ entregas
- ✅ asignaciones_entrega
- ✅ historial_estados_entrega
- ✅ incidencias_entrega
- ✅ historial_ubicaciones_repartidor
- ✅ notificaciones_logistica
- ✅ calificaciones_entrega

### Datos Iniciales:
- 4 categorías de orden (FOOD, MARKET, PHARMACY, PACKAGE)

## 🔧 Comandos Útiles

### Re-sincronizar Base de Datos (si es necesario)
```bash
# Desde Railway CLI
railway run node syncDatabase.js

# O desde el dashboard
# Settings → Execute Command → node syncDatabase.js
```

### Ver Estado de la Base de Datos
```bash
railway connect Postgres
\dt  # Listar tablas
\d+ entregas  # Ver estructura de tabla
```

## 🚨 Troubleshooting

### Error: No se puede conectar a PostgreSQL
```
✅ Verificar que el servicio PostgreSQL esté en "Running"
✅ Verificar las variables de entorno (DB_HOST, DB_PORT, etc.)
✅ Verificar que los servicios estén conectados
```

### Error: Tablas no se crean
```
✅ Verificar logs del despliegue
✅ Ejecutar manualmente: railway run node syncDatabase.js
✅ Verificar que NODE_ENV=production esté configurado
```

### Error: Port already in use
```
✅ Railway asigna el puerto automáticamente
✅ Asegúrate de usar process.env.PORT en el código
✅ El Dockerfile expone el puerto 3005 pero Railway puede usar otro
```

## 📱 URLs de Ejemplo

```bash
# Producción
https://logistica-production-xxxx.up.railway.app

# Endpoints disponibles:
GET  /                 # Info del servicio
GET  /health          # Health check
```

## 🎯 Próximos Pasos

Una vez desplegado:

1. ✅ Verificar que el servidor esté corriendo
2. ✅ Comprobar que las tablas se crearon
3. 🔨 Implementar rutas de entregas
4. 🔨 Implementar rutas de asignaciones
5. 🔨 Implementar rutas de incidencias

## 📝 Notas Importantes

- El Dockerfile ejecuta `syncDatabase.js` automáticamente al inicio
- En producción no se usa `alter: true`, solo crea tablas nuevas
- Los modelos están completamente definidos con Sequelize
- Las relaciones están configuradas en `src/models/index.js`

## 🔗 Links Útiles

- [Railway Docs](https://docs.railway.app)
- [PostgreSQL en Railway](https://docs.railway.app/databases/postgresql)
- [Variables de Entorno](https://docs.railway.app/develop/variables)

---

**Estado**: ✅ Listo para desplegar  
**Versión**: 3.0.0  
**Base de datos**: PostgreSQL  
**Framework**: Express + Sequelize
