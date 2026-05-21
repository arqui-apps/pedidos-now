# ✅ CHECKLIST DE DESPLIEGUE - RAILWAY

## 📦 PRE-DESPLIEGUE

### Archivos del Sistema
- [x] package.json creado con dependencias
- [x] Dockerfile optimizado para producción
- [x] railway.json configurado
- [x] .env.example como referencia
- [x] .gitignore protege credenciales
- [x] 9 modelos Sequelize implementados
- [x] syncDatabase.js para setup automático
- [x] server.js configurado para producción

### Base de Datos
- [x] Modelos PostgreSQL definidos
- [x] Relaciones configuradas en models/index.js
- [x] Script de sincronización funcionando
- [x] Datos iniciales (4 categorías) preparados

### Configuración
- [x] Variables de entorno configurables
- [x] Puerto dinámico (process.env.PORT)
- [x] Health check endpoint
- [x] CORS habilitado
- [x] Manejo de errores

---

## 🚀 PASOS DE DESPLIEGUE

### 1. Subir Código a GitHub
```bash
cd /home/lufi/programacion/pedidos-now-logistica
git status
git add services/logistica/
git commit -m "feat: módulo logística listo para Railway"
git push origin main
```

- [ ] Código subido a GitHub
- [ ] Repositorio accesible desde Railway

### 2. Crear Proyecto en Railway
```
1. Ir a: https://railway.app/dashboard
2. Click "New Project"
3. Seleccionar "Empty Project"
4. Nombrar: "Pedidos-Now-Logistica"
```

- [ ] Proyecto creado en Railway
- [ ] Proyecto visible en dashboard

### 3. Agregar PostgreSQL
```
1. En el proyecto, click "+ New"
2. Seleccionar "Database"
3. Elegir "PostgreSQL"
4. Esperar a que termine de crear
5. Anotar el nombre del servicio
```

- [ ] PostgreSQL creado
- [ ] Estado: Running (verde)
- [ ] Variables disponibles en pestaña "Variables"

### 4. Agregar Servicio de Logística
```
1. Click "+ New"
2. Seleccionar "GitHub Repo"
3. Elegir: pedidos-now-logistica
4. Railway detectará el monorepo
5. En "Root Directory" escribir: services/logistica
6. En "Builder" confirmar: Dockerfile
7. Click "Deploy"
```

- [ ] Servicio creado desde GitHub
- [ ] Root directory configurado
- [ ] Dockerfile detectado
- [ ] Primera build iniciada

### 5. Configurar Variables de Entorno
```
1. Click en el servicio "logistica"
2. Ir a pestaña "Variables"
3. Click "New Variable" → "Add Reference"
4. Configurar las siguientes referencias:
```

**Variables a Configurar:**
```bash
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
NODE_ENV=production
PORT=3005
```

**Pasos Detallados:**
```
Para cada variable de PostgreSQL:
1. Click "New Variable"
2. Seleccionar "Reference Variable"
3. En "Service" seleccionar el servicio PostgreSQL
4. En "Variable" seleccionar la correspondiente (PGHOST, PGPORT, etc)
5. En "Name" poner el nombre deseado (DB_HOST, DB_PORT, etc)
6. Click "Add"

Para variables simples:
1. Click "New Variable"
2. Seleccionar "Plain Text"
3. Variable: NODE_ENV, Value: production
4. Variable: PORT, Value: 3005
```

- [ ] DB_HOST configurado
- [ ] DB_PORT configurado
- [ ] DB_NAME configurado
- [ ] DB_USER configurado
- [ ] DB_PASSWORD configurado
- [ ] NODE_ENV configurado
- [ ] PORT configurado

### 6. Verificar Despliegue
```
1. Ir a pestaña "Deployments"
2. Ver logs en tiempo real
3. Buscar mensajes de éxito:
   ✅ "Sincronización de base de datos"
   ✅ "Modelos sincronizados"
   ✅ "SERVIDOR INICIADO"
4. Anotar la URL del servicio
```

- [ ] Build completado exitosamente
- [ ] Tablas creadas (ver logs)
- [ ] Servidor iniciado
- [ ] URL pública disponible

### 7. Probar Endpoints
```bash
# Reemplazar URL con la tuya
export URL="https://tu-servicio.up.railway.app"

# Health check
curl $URL/health

# Info del servicio
curl $URL/
```

**Respuesta Esperada de /health:**
```json
{"status":"healthy"}
```

**Respuesta Esperada de /:**
```json
{
  "message": "API Módulo de Logística v3.0",
  "status": "OK",
  "timestamp": "2026-04-09T..."
}
```

- [ ] /health responde correctamente
- [ ] / responde con info del servicio
- [ ] Respuestas en formato JSON

---

## 🔍 VERIFICACIÓN DE BASE DE DATOS

### Opción 1: Desde Logs
```
1. En Railway, ir a "Deployments"
2. Buscar en logs:
   "📊 Total de tablas: 9"
   "✅ CategoriaOrden"
   "✅ Repartidor"
   "✅ Entrega"
   etc.
```

- [ ] Logs muestran 9 tablas creadas
- [ ] Categorías iniciales insertadas
- [ ] Sin errores de sincronización

### Opción 2: Railway CLI (Avanzado)
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Conectar a PostgreSQL
railway connect Postgres

# Ver tablas
\dt

# Ver estructura de tabla
\d+ entregas

# Contar categorías
SELECT COUNT(*) FROM categorias_orden;
```

- [ ] Railway CLI instalado
- [ ] Conectado a base de datos
- [ ] 9 tablas visibles
- [ ] 4 categorías en tabla categorias_orden

---

## 📊 TABLAS ESPERADAS

Verificar que existan estas 9 tablas:

- [ ] categorias_orden
- [ ] repartidores
- [ ] entregas
- [ ] asignaciones_entrega
- [ ] historial_estados_entrega
- [ ] incidencias_entrega
- [ ] historial_ubicaciones_repartidor
- [ ] notificaciones_logistica
- [ ] calificaciones_entrega

---

## 🎯 POST-DESPLIEGUE

### Documentar
- [ ] Anotar URL pública del servicio
- [ ] Guardar credenciales de PostgreSQL
- [ ] Actualizar documentación del proyecto

### Monitoreo
- [ ] Agregar a favoritos el dashboard de Railway
- [ ] Configurar notificaciones (opcional)
- [ ] Revisar métricas de uso

### Siguientes Pasos
- [ ] Implementar rutas de entregas
- [ ] Implementar rutas de asignaciones
- [ ] Implementar rutas de incidencias
- [ ] Agregar autenticación JWT
- [ ] Conectar con módulo de restaurantes

---

## 🚨 TROUBLESHOOTING

### Si la Build Falla
- [ ] Verificar que "Root Directory" sea: services/logistica
- [ ] Verificar que Dockerfile esté en la carpeta correcta
- [ ] Revisar logs de build para errores específicos

### Si no se Conecta a PostgreSQL
- [ ] Verificar que el servicio PostgreSQL esté Running
- [ ] Verificar que las variables estén bien referenciadas
- [ ] Verificar en logs el mensaje de conexión

### Si las Tablas no se Crean
- [ ] Revisar logs de syncDatabase.js
- [ ] Verificar que NODE_ENV=production esté configurado
- [ ] Ejecutar manualmente: railway run node syncDatabase.js

---

## 📞 RECURSOS

- **Documentación Railway**: https://docs.railway.app
- **PostgreSQL en Railway**: https://docs.railway.app/databases/postgresql
- **Monorepo en Railway**: https://docs.railway.app/deploy/monorepo
- **Variables de Entorno**: https://docs.railway.app/develop/variables

---

## ✅ ÉXITO

Cuando todos los checkboxes estén marcados:

🎉 **¡FELICIDADES!**

Tu módulo de logística está:
- ✅ Desplegado en Railway
- ✅ Conectado a PostgreSQL
- ✅ Con base de datos inicializada
- ✅ Listo para recibir peticiones
- ✅ Preparado para implementar nuevas features

**Siguiente paso**: Empezar a desarrollar las rutas REST y funcionalidades del módulo.

---

**Versión**: 3.0.0  
**Última actualización**: 2026-04-09
