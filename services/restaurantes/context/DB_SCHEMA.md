# Esquema de Base de Datos

Base de datos: **MySQL**
ORM: **Sequelize**

---

## 📊 Tablas

### `restaurantes`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del restaurante |
| direccion | VARCHAR(255) | NOT NULL | Dirección física |
| telefono | VARCHAR(20) | NULL | Teléfono de contacto |
| email | VARCHAR(100) | NULL, UNIQUE | Email de contacto |
| descripcion | TEXT | NULL | Descripción del restaurante |
| activo | BOOLEAN | DEFAULT true | Estado del restaurante |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `horarios`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| restauranteId | INT | FK → restaurantes.id, NOT NULL | Restaurante al que pertenece |
| diaSemana | ENUM | NOT NULL | Lunes-Domingo |
| horaApertura | TIME | NOT NULL | Hora de apertura |
| horaCierre | TIME | NOT NULL | Hora de cierre |
| cerrado | BOOLEAN | DEFAULT false | Si está cerrado ese día |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `tipos_producto`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(50) | NOT NULL, UNIQUE | Nombre del tipo |
| descripcion | VARCHAR(255) | NULL | Descripción |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `productos`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| restauranteId | INT | FK → restaurantes.id, NOT NULL | Restaurante propietario |
| tipoProductoId | INT | FK → tipos_producto.id, NOT NULL | Tipo de producto |
| nombre | VARCHAR(100) | NOT NULL | Nombre del producto |
| descripcion | TEXT | NULL | Descripción |
| disponible | BOOLEAN | DEFAULT true | Disponibilidad actual |
| activo | BOOLEAN | DEFAULT true | Si el producto está activo |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `tipos_combo`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(50) | NOT NULL, UNIQUE | Nombre del tipo |
| descripcion | VARCHAR(255) | NULL | Descripción |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `combos`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| restauranteId | INT | FK → restaurantes.id, NOT NULL | Restaurante propietario |
| tipoComboId | INT | FK → tipos_combo.id, NOT NULL | Tipo de combo |
| nombre | VARCHAR(100) | NOT NULL | Nombre del combo |
| descripcion | TEXT | NULL | Descripción |
| disponible | BOOLEAN | DEFAULT true | Disponibilidad actual |
| activo | BOOLEAN | DEFAULT true | Si el combo está activo |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `precios`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| productoId | INT | FK → productos.id, NULL | Producto al que aplica |
| comboId | INT | FK → combos.id, NULL | Combo al que aplica |
| precio | DECIMAL(10,2) | NOT NULL | Valor del precio |
| fechaInicio | DATE | NOT NULL | Fecha de inicio de vigencia |
| fechaFin | DATE | NULL | Fecha de fin de vigencia |
| activo | BOOLEAN | DEFAULT true | Si el precio está activo |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

**Constraint**: Un precio debe estar asociado a un producto **O** a un combo, no a ambos.

---

### `descuentos`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| restauranteId | INT | FK → restaurantes.id, NOT NULL | Restaurante |
| productoId | INT | FK → productos.id, NULL | Producto específico |
| comboId | INT | FK → combos.id, NULL | Combo específico |
| nombre | VARCHAR(100) | NOT NULL | Nombre del descuento |
| tipo | ENUM | NOT NULL | 'porcentaje' o 'monto_fijo' |
| valor | DECIMAL(10,2) | NOT NULL | Valor del descuento |
| fechaInicio | DATE | NOT NULL | Inicio de vigencia |
| fechaFin | DATE | NOT NULL | Fin de vigencia |
| activo | BOOLEAN | DEFAULT true | Estado del descuento |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

---

### `pedidos`
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| restauranteId | INT | FK → restaurantes.id, NOT NULL | Restaurante del pedido |
| clienteId | INT | NOT NULL | ID del cliente (servicio Auth) |
| estado | ENUM | NOT NULL, DEFAULT 'pendiente' | Estado del pedido |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal sin descuentos |
| descuento | DECIMAL(10,2) | DEFAULT 0 | Monto de descuento |
| total | DECIMAL(10,2) | NOT NULL | Total a pagar |
| fechaPedido | TIMESTAMP | DEFAULT NOW | Fecha del pedido |
| fechaCancelacion | TIMESTAMP | NULL | Fecha de cancelación |
| motivoCancelacion | TEXT | NULL | Motivo de cancelación |
| observaciones | TEXT | NULL | Observaciones adicionales |
| createdAt | TIMESTAMP | AUTO | Fecha de creación |
| updatedAt | TIMESTAMP | AUTO | Fecha de última actualización |

**Estados posibles**: 
- `pendiente`
- `confirmado`
- `en_preparacion`
- `listo`
- `entregado`
- `cancelado`

---

## 🔗 Relaciones

```
Restaurante 1:N Horarios
Restaurante 1:N Productos
Restaurante 1:N Combos
Restaurante 1:N Descuentos
Restaurante 1:N Pedidos

TipoProducto 1:N Productos
TipoCombo 1:N Combos

Producto 1:N Precios
Combo 1:N Precios
Producto 1:N Descuentos
Combo 1:N Descuentos
```
