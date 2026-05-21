# Actualización de Rutas - Arquitectura RESTful Jerárquica

**Fecha**: 2026-03-17
**Estado**: ✅ COMPLETADO

---

## 🎯 Nueva Estructura

Todas las rutas ahora siguen el patrón jerárquico:
```
/restaurantes/:restaurante_id/{recurso}
```

---

## 📁 Archivos Modificados

1. `src/routes/index.js` - Router principal
2. `src/routes/restaurantes/restaurante.routes.js` - Rutas de restaurantes + subrutas
3. `src/routes/productos/producto.routes.js` - Rutas de productos
4. `src/routes/combos/combo.routes.js` - Rutas de combos
5. `src/routes/pedidos/pedido.routes.js` - Rutas de pedidos
6. `src/routes/restaurantes/horario.routes.js` - Rutas de horarios
7. `src/routes/precios/precio.routes.js` - Rutas de precios

---

## 🗂️ Jerarquía Completa

### **Nivel 1: Restaurantes Base**
```
GET    /restaurantes                    → Listar todos
POST   /restaurantes                    → Crear nuevo
GET    /restaurantes/:id                → Obtener por ID
PUT    /restaurantes/:id                → Actualizar
DELETE /restaurantes/:id                → Inactivar
PATCH  /restaurantes/:id/disponibilidad → Toggle disponibilidad
```

### **Nivel 2: Horarios**
```
GET    /restaurantes/:restaurante_id/horarios            → Listar horarios
POST   /restaurantes/:restaurante_id/horarios            → Crear horario
GET    /restaurantes/:restaurante_id/horarios/:id        → Obtener horario
PUT    /restaurantes/:restaurante_id/horarios/:id        → Actualizar
DELETE /restaurantes/:restaurante_id/horarios/:id        → Inactivar
PATCH  /restaurantes/:restaurante_id/horarios/:id/activo → Toggle activo
```

### **Nivel 2: Productos**
```
GET    /restaurantes/:restaurante_id/productos            → Listar productos
POST   /restaurantes/:restaurante_id/productos            → Crear producto
GET    /restaurantes/:restaurante_id/productos/:id        → Obtener producto
PUT    /restaurantes/:restaurante_id/productos/:id        → Actualizar
DELETE /restaurantes/:restaurante_id/productos/:id        → Inactivar
PATCH  /restaurantes/:restaurante_id/productos/:id/activo → Toggle activo
```

#### **Nivel 3: Precios de Productos**
```
GET /restaurantes/:restaurante_id/productos/:producto_id/precio/actual    → Precio actual
GET /restaurantes/:restaurante_id/productos/:producto_id/precio/historial → Historial
GET /restaurantes/:restaurante_id/productos/:producto_id/precio/comparar  → Comparar
PUT /restaurantes/:restaurante_id/productos/:producto_id/precio           → Actualizar
```

### **Nivel 2: Combos**
```
GET    /restaurantes/:restaurante_id/combos            → Listar combos
POST   /restaurantes/:restaurante_id/combos            → Crear combo
GET    /restaurantes/:restaurante_id/combos/:id        → Obtener combo
PUT    /restaurantes/:restaurante_id/combos/:id        → Actualizar
DELETE /restaurantes/:restaurante_id/combos/:id        → Inactivar
PATCH  /restaurantes/:restaurante_id/combos/:id/activo → Toggle activo
```

#### **Nivel 3: Productos del Combo**
```
POST   /restaurantes/:restaurante_id/combos/:id/productos             → Agregar productos
DELETE /restaurantes/:restaurante_id/combos/:id/productos/:producto_id → Remover producto
```

### **Nivel 2: Pedidos**
```
GET /restaurantes/:restaurante_id/pedidos         → Listar pedidos
POST /restaurantes/:restaurante_id/pedidos        → Crear pedido
GET /restaurantes/:restaurante_id/pedidos/:id     → Obtener pedido
PUT /restaurantes/:restaurante_id/pedidos/:id     → Actualizar
PUT /restaurantes/:restaurante_id/pedidos/:id/estado → Cambiar estado
```

#### **Nivel 3: Detalles del Pedido**
```
GET    /restaurantes/:restaurante_id/pedidos/:pedido_id/detalles     → Listar detalles
POST   /restaurantes/:restaurante_id/pedidos/:pedido_id/detalles     → Agregar ítem
GET    /restaurantes/:restaurante_id/pedidos/:pedido_id/detalles/:id → Obtener detalle
PUT    /restaurantes/:restaurante_id/pedidos/:pedido_id/detalles/:id → Actualizar
DELETE /restaurantes/:restaurante_id/pedidos/:pedido_id/detalles/:id → Eliminar
```

#### **Nivel 3: Historial de Estados**
```
GET /restaurantes/:restaurante_id/pedidos/:pedido_id/historial     → Listar historial
GET /restaurantes/:restaurante_id/pedidos/:pedido_id/historial/:id → Obtener registro
```

#### **Nivel 3: Cancelación**
```
GET  /restaurantes/:restaurante_id/pedidos/:pedido_id/cancelacion         → Obtener info
POST /restaurantes/:restaurante_id/pedidos/:pedido_id/cancelacion/cancelar → Cancelar
```

### **Rutas Globales**
```
GET    /estados-pedido     → Listar estados
POST   /estados-pedido     → Crear estado
GET    /estados-pedido/:id → Obtener estado
PUT    /estados-pedido/:id → Actualizar
DELETE /estados-pedido/:id → Eliminar
```

---

## 🔧 Configuración Técnica

### Router Options
```javascript
const router = express.Router({ mergeParams: true });
```

**`mergeParams: true`** es CRÍTICO para:
- Heredar parámetros de routers padres
- Permitir que `/restaurantes/:restaurante_id/productos` acceda a `restaurante_id`
- Mantener la jerarquía de recursos

### Anidación de Routers

**En `restaurante.routes.js`:**
```javascript
const productoRoutes = require('../productos/producto.routes');
router.use('/:restaurante_id/productos', productoRoutes);
```

**En `producto.routes.js`:**
```javascript
const router = express.Router({ mergeParams: true });
// Ahora tiene acceso a req.params.restaurante_id
```

---

## 🔒 Seguridad y Validación

Cada ruta ahora:
1. **Valida el restaurante_id** existe en params
2. **Verifica pertenencia** del recurso al restaurante
3. **Previene acceso cruzado** entre restaurantes
4. **Mantiene consistencia** en toda la jerarquía

---

## 📋 Migración de URLs

### Antes → Después

**Productos:**
```diff
- POST /api/productos (body: { restaurante_id: 1, ... })
+ POST /api/restaurantes/1/productos

- GET /api/productos/5
+ GET /api/restaurantes/1/productos/5

- GET /api/productos/restaurante/1
+ GET /api/restaurantes/1/productos
```

**Combos:**
```diff
- POST /api/combos (body: { restaurante_id: 1, ... })
+ POST /api/restaurantes/1/combos

- POST /api/combos/3/productos
+ POST /api/restaurantes/1/combos/3/productos
```

**Pedidos:**
```diff
- POST /api/pedidos (body: { restaurante_id: 1, ... })
+ POST /api/restaurantes/1/pedidos

- GET /api/pedidos?restaurante_id=1
+ GET /api/restaurantes/1/pedidos

- PUT /api/pedidos/10/estado
+ PUT /api/restaurantes/1/pedidos/10/estado
```

**Horarios:**
```diff
- POST /api/horarios (body: { restaurante_id: 1, ... })
+ POST /api/restaurantes/1/horarios

- GET /api/horarios/restaurante/1
+ GET /api/restaurantes/1/horarios
```

**Precios:**
```diff
- GET /api/precios/producto/5/actual
+ GET /api/restaurantes/1/productos/5/precio/actual

- PUT /api/precios/producto/5
+ PUT /api/restaurantes/1/productos/5/precio
```

---

## ✅ Beneficios

1. **URLs Semánticas**: La URL refleja la jerarquía de recursos
2. **Seguridad**: Contexto de restaurante en cada petición
3. **RESTful**: Sigue estándares REST correctamente
4. **Mantenibilidad**: Estructura clara y predecible
5. **Escalabilidad**: Fácil agregar nuevos recursos anidados

---

## 🚀 Compatibilidad con Broker

El broker llamará a:
```
https://link.com/restaurantes/1/pedidos
https://link.com/restaurantes/1/productos
https://link.com/restaurantes/2/combos
```

El servicio está listo para recibir estas peticiones desde el broker.

---

**Nota**: Todos los controladores ya están actualizados para trabajar con esta estructura.
