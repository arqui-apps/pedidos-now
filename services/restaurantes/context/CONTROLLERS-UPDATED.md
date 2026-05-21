# Actualización de Controladores - Migración a Arquitectura RESTful

**Fecha**: 2026-03-17
**Estado**: ✅ COMPLETADO

## 🎯 Objetivo

Actualizar todos los controladores para que reciban el `restaurante_id` desde los parámetros de la URL en lugar del body, siguiendo el patrón RESTful:
- **Antes**: `POST /productos` con `{ restaurante_id: 1, nombre: "Pizza" }`
- **Después**: `POST /restaurantes/:restaurante_id/productos` con `{ nombre: "Pizza" }`

---

## 📝 Cambios Realizados

### 1. **Productos Controller** (`src/controllers/productos/producto.controller.js`)

#### Métodos Actualizados:

**`create()`**
- ✅ `restaurante_id` ahora se obtiene de `req.params`
- ✅ Valida existencia del restaurante antes de crear
- ✅ Ya no requiere `restaurante_id` en el body

**`getById()`**
- ✅ Usa `Producto.findOne({ where: { id, restaurante_id } })`
- ✅ Valida que el producto pertenezca al restaurante

**`update()`**
- ✅ Valida que el producto pertenezca al restaurante antes de actualizar
- ✅ `restaurante_id` viene de params

**`delete()`**
- ✅ Valida pertenencia antes de inactivar

**`toggleActivo()`**
- ✅ Valida pertenencia antes de cambiar estado

---

### 2. **Combos Controller** (`src/controllers/combos/combo.controller.js`)

#### Métodos Actualizados:

**`create()`**
- ✅ `restaurante_id` desde params
- ✅ Valida existencia del restaurante

**`getById()`**
- ✅ Valida pertenencia al restaurante

**`update()`**
- ✅ Valida pertenencia antes de actualizar

**`delete()`**
- ✅ Valida pertenencia antes de inactivar

**`toggleActivo()`**
- ✅ Valida pertenencia antes de cambiar estado

**`addProductos()`**
- ✅ Valida que el combo pertenezca al restaurante

**`removeProducto()`**
- ✅ Valida pertenencia del combo antes de remover productos

---

### 3. **Pedidos Controller** (`src/controllers/pedidos/pedido.controller.js`)

#### Métodos Actualizados:

**`create()`**
- ✅ `restaurante_id` desde params
- ✅ Valida existencia, actividad y disponibilidad del restaurante
- ✅ Verifica que productos/combos pertenezcan al mismo restaurante
- ✅ Ya no requiere `restaurante_id` en el body

**`getAll()`**
- ✅ Filtra automáticamente por `restaurante_id` desde params
- ✅ Permite filtros adicionales por query (cliente_id, estado_id)

**`getById()`**
- ✅ Valida que el pedido pertenezca al restaurante

**`update()`**
- ✅ Valida pertenencia antes de actualizar

**`cambiarEstado()`**
- ✅ Valida pertenencia antes de cambiar estado

---

### 4. **Horarios Controller** (`src/controllers/restaurantes/horario.controller.js`)

#### Métodos Actualizados:

**`create()`**
- ✅ `restaurante_id` desde params
- ✅ Valida existencia del restaurante

**`getByRestaurante()`**
- ✅ Valida existencia del restaurante antes de buscar horarios

**`update()`**
- ✅ Valida que horario pertenezca al restaurante

**`delete()`**
- ✅ Valida pertenencia antes de inactivar

**`toggleActivo()`**
- ✅ Valida pertenencia antes de cambiar estado

---

### 5. **Precios Controller** (`src/controllers/precios/precio.controller.js`)

#### Métodos Actualizados:

**`getHistorialByProducto()`**
- ✅ Recibe `restaurante_id` desde params
- ✅ Valida que el producto pertenezca al restaurante

**`getPrecioActual()`**
- ✅ Valida pertenencia del producto al restaurante

**`actualizarPrecio()`**
- ✅ Valida pertenencia antes de actualizar precio

**`compararPrecios()`**
- ✅ Valida pertenencia del producto

---

### 6. **Detalle Pedido Controller** (`src/controllers/pedidos/detalle-pedido.controller.js`)

#### Métodos Actualizados:

**`getByPedido()`**
- ✅ Valida que el pedido pertenezca al restaurante

**`getById()`**
- ✅ Valida pertenencia del pedido antes de buscar detalle

**`create()`**
- ✅ Valida pertenencia del pedido
- ✅ Verifica que productos/combos pertenezcan al mismo restaurante

**`update()`**
- ✅ Valida pertenencia antes de actualizar

**`delete()`**
- ✅ Valida pertenencia antes de eliminar

---

### 7. **Historial Estados Controller** (`src/controllers/pedidos/historial-estados-pedido.controller.js`)

#### Métodos Actualizados:

**`getByPedido()`**
- ✅ Valida que el pedido pertenezca al restaurante

---

### 8. **Cancelaciones Controller** (`src/controllers/pedidos/cancelacion-pedido.controller.js`)

#### Métodos Actualizados:

**`cancelar()`**
- ✅ Recibe `restaurante_id` desde params
- ✅ Valida que el pedido pertenezca al restaurante antes de cancelar

---

## 🔒 Beneficios de Seguridad

1. **Prevención de Acceso No Autorizado**
   - Un restaurante no puede modificar/ver recursos de otro restaurante
   - El `restaurante_id` en la URL es más difícil de manipular que en el body

2. **Validación en Múltiples Capas**
   - Verificación de existencia del restaurante
   - Validación de pertenencia del recurso
   - Verificación de estado/disponibilidad cuando aplica

3. **Arquitectura RESTful Correcta**
   - URLs semánticas: `/restaurantes/:restaurante_id/productos/:id`
   - Jerarquía clara de recursos
   - Parámetros en la posición correcta

---

## 📋 Siguiente Paso: Actualizar Routes

Los controladores están listos para recibir `restaurante_id` desde `req.params`.

**Próxima tarea**: Actualizar los archivos de rutas para que sigan el patrón:
```
/restaurantes/:restaurante_id/productos
/restaurantes/:restaurante_id/combos
/restaurantes/:restaurante_id/pedidos
/restaurantes/:restaurante_id/horarios
etc.
```

---

## ✅ Validación

Todos los controladores fueron validados con Node.js y tienen sintaxis correcta.

---

**Nota**: Los modelos ya están actualizados y son correctos. Las relaciones en `src/models/index.js` están bien definidas.
