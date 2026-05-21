# 📮 Colecciones Postman - Módulo Logística

Esta carpeta contiene las colecciones de Postman para probar todos los endpoints del módulo de logística.

## 📂 Colecciones Disponibles

### 1. **Entregas.postman_collection.json**
Gestión completa de entregas

**Endpoints:**
- ✅ `POST /api/logistica/entregas` - Crear entrega
- ✅ `GET /api/logistica/entregas` - Listar entregas (con filtros y paginación)
- ✅ `GET /api/logistica/entregas/:id` - Obtener entrega por ID
- ✅ `PUT /api/logistica/entregas/:id` - Actualizar entrega
- ✅ `PATCH /api/logistica/entregas/:id/estado` - Cambiar estado
- ✅ `PATCH /api/logistica/entregas/:id/cancelar` - Cancelar entrega
- ✅ `GET /api/logistica/entregas/:id/historial` - Ver historial de estados

### 2. **Asignaciones.postman_collection.json**
Asignación de repartidores a entregas

**Endpoints:**
- ✅ `POST /api/logistica/asignaciones` - Asignar repartidor
- ✅ `PUT /api/logistica/asignaciones/entrega/:id` - Reasignar repartidor
- ✅ `GET /api/logistica/asignaciones/entrega/:id` - Obtener asignación activa
- ✅ `GET /api/logistica/asignaciones/entrega/:id/historial` - Historial de asignaciones
- ✅ `GET /api/logistica/asignaciones/repartidor/:repartidor_id` - Entregas por repartidor
- ✅ `DELETE /api/logistica/asignaciones/entrega/:id` - Desasignar repartidor

### 3. **Incidencias.postman_collection.json**
Gestión de incidencias durante entregas

**Endpoints:**
- ✅ `POST /api/logistica/incidencias` - Crear incidencia
- ✅ `GET /api/logistica/incidencias` - Listar incidencias (con filtros)
- ✅ `GET /api/logistica/incidencias/:id` - Obtener incidencia por ID
- ✅ `GET /api/logistica/incidencias/entrega/:id` - Incidencias por entrega
- ✅ `GET /api/logistica/incidencias/repartidor/:repartidor_id` - Incidencias por repartidor
- ✅ `PUT /api/logistica/incidencias/:id` - Actualizar incidencia
- ✅ `PATCH /api/logistica/incidencias/:id/resolver` - Resolver incidencia
- ✅ `PATCH /api/logistica/incidencias/:id/reabrir` - Reabrir incidencia
- ✅ `GET /api/logistica/incidencias/stats/estadisticas` - Estadísticas de incidencias

### 4. **Estadisticas.postman_collection.json**
Estadísticas y reportes del módulo

**Endpoints:**
- ✅ `GET /api/logistica/estadisticas/generales` - Dashboard general
- ✅ `GET /api/logistica/estadisticas/periodo` - Resumen por periodo
- ✅ `GET /api/logistica/estadisticas/repartidores` - Rendimiento de repartidores

---

## 🚀 Cómo usar las colecciones

### 1. Importar en Postman

1. Abre Postman
2. Click en **Import**
3. Arrastra los archivos `.json` o selecciónalos
4. Las colecciones se importarán automáticamente

### 2. Configurar Variables de Entorno

Crea un **Environment** en Postman con la siguiente variable:

```
base_url = http://localhost:3000
```

O la URL donde esté corriendo tu servidor.

### 3. Ejecutar Requests

Cada request incluye:
- ✅ Headers configurados
- ✅ Body de ejemplo
- ✅ Descripción detallada
- ✅ Respuestas esperadas
- ✅ Posibles errores

---

## 📋 Flujo de Trabajo Recomendado

### Crear y gestionar una entrega completa:

1. **Crear Entrega**
   ```
   POST /api/logistica/entregas
   ```

2. **Asignar Repartidor**
   ```
   POST /api/logistica/asignaciones
   Body: { entrega_id, repartidor_id }
   ```

3. **Cambiar Estado a "En Ruta"**
   ```
   PATCH /api/logistica/entregas/:id/estado
   Body: { estado_nuevo: "en_ruta" }
   ```

4. **Registrar Incidencia (si ocurre)**
   ```
   POST /api/logistica/incidencias
   Body: { entrega_id, tipo_incidencia, descripcion }
   ```

5. **Marcar como Entregada**
   ```
   PATCH /api/logistica/entregas/:id/estado
   Body: { estado_nuevo: "entregada" }
   ```

6. **Ver Historial Completo**
   ```
   GET /api/logistica/entregas/:id/historial
   ```

---

## 🔍 Filtros y Paginación

### Entregas
```
GET /api/logistica/entregas?page=1&limit=50&estado_entrega=pendiente&empresa_id=1&activa=true
```

### Incidencias
```
GET /api/logistica/incidencias?page=1&limit=50&resuelta=false&tipo_incidencia=cliente_ausente
```

### Asignaciones por Repartidor
```
GET /api/logistica/asignaciones/repartidor/10?activa=true
```

---

## 📊 Estados de Entrega

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Entrega creada, sin asignar |
| `asignada` | Repartidor asignado |
| `en_ruta` | Repartidor en camino |
| `entregada` | Entrega completada ✅ |
| `fallida` | No se pudo entregar |
| `cancelada` | Entrega cancelada |

---

## 🚨 Tipos de Incidencia

| Tipo | Descripción |
|------|-------------|
| `direccion_incorrecta` | Dirección no válida |
| `cliente_ausente` | Cliente no disponible |
| `paquete_danado` | Paquete dañado |
| `rechazo_cliente` | Cliente rechazó entrega |
| `accidente` | Accidente durante entrega |
| `otro` | Otra incidencia |

---

## 📝 Ejemplos de Body

### Crear Entrega
```json
{
  "tipo_origen": "pedido",
  "origen_id": 1001,
  "empresa_id": 1,
  "sucursal_id": 1,
  "cliente_id": 500,
  "direccion_entrega": "6a Av. 10-25, Zona 9, Guatemala",
  "referencia_direccion": "Edificio azul",
  "instrucciones_entrega": "Llamar al llegar",
  "monto_cobrar": 150.00,
  "fecha_entrega_estimada": "2026-03-21T15:00:00Z"
}
```

### Asignar Repartidor
```json
{
  "entrega_id": 1,
  "repartidor_id": 10
}
```

### Crear Incidencia
```json
{
  "entrega_id": 1,
  "repartidor_id": 10,
  "tipo_incidencia": "cliente_ausente",
  "descripcion": "Cliente no se encontraba en el domicilio"
}
```

### Cambiar Estado
```json
{
  "estado_nuevo": "en_ruta",
  "comentario": "Repartidor salió a entregar"
}
```

---

## ⚠️ Errores Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| 400 | Datos inválidos | Verificar formato de datos |
| 404 | Recurso no encontrado | Verificar que el ID existe |
| 500 | Error del servidor | Revisar logs del servidor |

---

## 🔗 Variables de Postman

Puedes usar variables en Postman para agilizar las pruebas:

```javascript
// Guardar ID de entrega creada
pm.environment.set("entrega_id", pm.response.json().data.id_entrega);

// Usar en siguiente request
{{entrega_id}}
```

---

## 📞 Soporte

Para más información sobre la estructura de los datos y relaciones, consulta:
- `/src/models/` - Modelos de base de datos
- `/src/controllers/` - Lógica de negocio
- `/db/logisticaActualizada.sql` - Schema SQL

---

**Total de Endpoints:** 25+
**Colecciones:** 4
**Última actualización:** Marzo 2026
