# Actualización de Postman Tests y Collections

**Fecha**: 2026-03-17
**Estado**: ✅ COMPLETADO

---

## 📋 Resumen

Se actualizaron **38+ archivos JSON individuales** y se crearon **6 colecciones Postman** completas para facilitar las pruebas de la API.

---

## 🔄 Cambios en Archivos Individuales

### Actualización de URLs

**ANTES:**
```json
{
  "endpoint": "POST http://localhost:3000/api/productos",
  "body": {
    "restaurante_id": 1,
    "nombre": "Pizza"
  }
}
```

**DESPUÉS:**
```json
{
  "endpoint": "POST http://localhost:3000/api/restaurantes/1/productos",
  "body": {
    "nombre": "Pizza"
  },
  "nota": "restaurante_id ahora viene en la URL, NO en el body"
}
```

### Archivos Actualizados por Categoría

#### Productos (7 archivos)
- ✅ `01-crear-producto.json`
- ✅ `02-crear-producto-minimo.json`
- ✅ `03-listar-productos.json`
- ✅ `04-obtener-producto.json`
- ✅ `06-actualizar-producto.json`
- ✅ `07-cambiar-estado.json`
- ✅ `08-eliminar-producto.json`
- ❌ `05-listar-por-restaurante.json` (eliminado - ahora es el método principal)

#### Horarios (7 archivos)
- ✅ `01-crear-horario.json`
- ✅ `02-crear-horario-semana.json`
- ✅ `03-listar-horarios.json`
- ✅ `04-obtener-horario.json`
- ✅ `06-actualizar-horario.json`
- ✅ `07-eliminar-horario.json`
- ✅ `08-toggle-activo.json`
- ❌ `05-obtener-horarios-por-restaurante.json` (eliminado - redundante)

#### Pedidos - Detalles (6 archivos)
- ✅ `01-listar-detalles.json`
- ✅ `02-obtener-detalle.json`
- ✅ `03-agregar-item-producto.json`
- ✅ `04-agregar-item-combo.json`
- ✅ `05-actualizar-detalle.json`
- ✅ `06-eliminar-detalle.json`

#### Pedidos - Cancelaciones (6 archivos)
- ✅ `01-listar-cancelaciones.json`
- ✅ `02-obtener-cancelacion.json`
- ✅ `03-cancelacion-por-pedido.json`
- ✅ `04-cancelar-por-cliente.json`
- ✅ `05-cancelar-por-restaurante.json`
- ✅ `06-errores-cancelacion.json`

#### Pedidos - Estados (5 archivos)
- ✅ `01-listar-estados.json`
- ✅ `02-obtener-estado.json`
- ✅ `03-crear-estado.json`
- ✅ `04-actualizar-estado.json`
- ✅ `05-eliminar-estado.json`

#### Restaurantes (7 archivos)
- ✅ `01-crear-restaurante.json`
- ✅ `02-crear-restaurante-minimo.json`
- ✅ `03-listar-restaurantes.json`
- ✅ `04-obtener-restaurante.json`
- ✅ `05-actualizar-restaurante.json`
- ✅ `06-eliminar-restaurante.json`
- ✅ `07-cambiar-disponibilidad.json`

---

## 📦 Colecciones Postman Creadas

### 1. MASTER-COLLECTION.postman_collection.json
**Ubicación**: `postman-tests/`  
**Descripción**: Colección completa con todos los endpoints del servicio

**Estructura:**
```
00 - Health Check
├── Restaurantes (5 requests)
├── Horarios (3 requests)
├── Productos (6 requests)
├── Combos (3 requests)
├── Pedidos (7 requests)
└── Estados de Pedido (1 request)
```

**Variables:**
- `baseUrl`: http://localhost:3000/api
- `restaurante_id`: 1
- `producto_id`: 1
- `combo_id`: 1
- `pedido_id`: 1
- `horario_id`: 1

---

### 2. PRODUCTOS-COLLECTION.postman_collection.json
**Ubicación**: `postman-tests/productos/`

**Endpoints:**
1. Crear Producto Completo
2. Crear Producto Mínimo
3. Listar Productos del Restaurante
4. Obtener Producto Específico
5. Actualizar Producto
6. Toggle Activo Producto
7. Eliminar (Inactivar) Producto

---

### 3. HORARIOS-COLLECTION.postman_collection.json
**Ubicación**: `postman-tests/horarios/`

**Endpoints:**
1. Crear Horario
2. Crear Horarios Semana Completa
3. Listar Horarios del Restaurante
4. Obtener Horario Específico
5. Actualizar Horario
6. Eliminar (Inactivar) Horario
7. Toggle Activo Horario

---

### 4. RESTAURANTES-COLLECTION.postman_collection.json
**Ubicación**: `postman-tests/restaurantes/`

**Endpoints:**
1. Crear Restaurante Completo
2. Crear Restaurante Mínimo
3. Listar Restaurantes
4. Obtener Restaurante
5. Actualizar Restaurante
6. Eliminar (Inactivar) Restaurante
7. Cambiar Disponibilidad

---

### 5. PEDIDOS-COLLECTION.postman_collection.json
**Ubicación**: `postman-tests/pedidos/`

**Estructura organizada en carpetas:**

**Pedidos Principales:**
1. Crear Pedido
2. Listar Pedidos del Restaurante
3. Obtener Pedido Específico
4. Actualizar Pedido
5. Cambiar Estado del Pedido

**Detalles del Pedido:**
1. Listar Detalles
2. Obtener Detalle Específico
3. Agregar Producto al Pedido
4. Agregar Combo al Pedido
5. Actualizar Detalle
6. Eliminar Ítem del Pedido

**Historial de Estados:**
1. Ver Historial del Pedido

**Cancelaciones:**
1. Obtener Cancelación del Pedido
2. Cancelar por Cliente
3. Cancelar por Restaurante

**Estados de Pedido:**
1. Listar Estados

---

### 6. COMBOS-COLLECTION.postman_collection.json
**Ubicación**: `postman-tests/`

**Endpoints:**
1. Crear Combo con Productos
2. Crear Combo Simple
3. Listar Combos del Restaurante
4. Obtener Combo Específico
5. Actualizar Combo
6. Agregar Productos al Combo
7. Remover Producto del Combo
8. Toggle Activo Combo
9. Eliminar (Inactivar) Combo

---

## 🎯 Cambios Principales

### 1. Estructura de URLs Actualizada
Todos los endpoints ahora siguen el patrón jerárquico:
```
/restaurantes/:restaurante_id/{recurso}
```

### 2. Body Simplificado
El `restaurante_id` ya no se envía en el body, viene en la URL:

**Antes:**
```json
POST /api/productos
{
  "restaurante_id": 1,
  "nombre": "Pizza",
  "precio": 10.50
}
```

**Después:**
```json
POST /api/restaurantes/1/productos
{
  "nombre": "Pizza",
  "precio": 10.50
}
```

### 3. Variables de Postman
Todas las colecciones incluyen variables para facilitar las pruebas:
- `{{baseUrl}}`: URL base de la API
- `{{restaurante_id}}`: ID del restaurante
- `{{producto_id}}`: ID del producto
- `{{combo_id}}`: ID del combo
- `{{pedido_id}}`: ID del pedido
- etc.

---

## 📥 Cómo Importar en Postman

### Opción 1: Colección Individual
1. Abrir Postman
2. Click en **"Import"** (botón superior izquierdo)
3. Seleccionar archivo específico (ej: `PRODUCTOS-COLLECTION.postman_collection.json`)
4. Click en **"Import"**

### Opción 2: Colección Master (Recomendado)
1. Importar `MASTER-COLLECTION.postman_collection.json`
2. Tendrás todos los endpoints organizados en carpetas
3. Configurar las variables de la colección según tu entorno

### Opción 3: Importar Todo
1. En Postman, click en "Import"
2. Seleccionar la carpeta `postman-tests/`
3. Postman importará todas las colecciones automáticamente

---

## 🔧 Configuración de Variables

### En Postman:
1. Click derecho en la colección
2. Seleccionar **"Edit"**
3. Ir a la pestaña **"Variables"**
4. Modificar los valores según tu entorno:
   - `baseUrl`: URL de tu servidor (local, dev, prod)
   - `restaurante_id`: ID del restaurante a probar
   - etc.

### Ambientes Sugeridos:

**Local:**
```
baseUrl = http://localhost:3000/api
restaurante_id = 1
```

**Desarrollo:**
```
baseUrl = https://dev-api.pedidos-now.com/restaurantes
restaurante_id = 1
```

**Producción:**
```
baseUrl = https://api.pedidos-now.com/restaurantes
restaurante_id = 1
```

---

## 🧪 Orden de Pruebas Sugerido

### 1. Setup Inicial
```
1. Health Check
2. Crear Restaurante
3. Crear Horarios (semana completa)
```

### 2. Productos
```
1. Crear Producto 1
2. Crear Producto 2
3. Listar Productos
4. Actualizar Precio
```

### 3. Combos
```
1. Crear Combo
2. Agregar Productos
3. Listar Combos
```

### 4. Pedidos
```
1. Crear Pedido
2. Ver Detalles
3. Cambiar Estado (pendiente → confirmado → preparación → listo)
4. Ver Historial
```

### 5. Cancelaciones
```
1. Crear Pedido
2. Cancelar por Cliente
3. Ver Cancelación
```

---

## 💡 Tips para Pruebas

1. **Usar variables**: Facilita cambiar entre restaurantes y recursos
2. **Orden secuencial**: Algunos endpoints dependen de otros (crear antes de actualizar)
3. **IDs dinámicos**: Actualizar las variables con los IDs reales generados
4. **Tests automáticos**: Agregar scripts de validación en Postman

### Ejemplo de Test Script en Postman:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has success=true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

// Guardar ID para usar en próximas requests
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("producto_id", jsonData.data.id);
}
```

---

## 📊 Validación de Formato

Todas las colecciones siguen el estándar:
- ✅ Schema: Postman Collection v2.1.0
- ✅ Variables correctamente definidas
- ✅ Headers incluidos
- ✅ Body en formato raw JSON
- ✅ URLs con placeholders de variables

---

## 🚀 Listo para Usar

Todas las colecciones están listas para:
- ✅ Importar en Postman
- ✅ Ejecutar pruebas manuales
- ✅ Automatizar con Newman
- ✅ Integrar en CI/CD

---

**Próximo paso**: Importar las colecciones en Postman y realizar pruebas de integración.
