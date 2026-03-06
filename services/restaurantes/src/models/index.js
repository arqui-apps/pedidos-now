// ============================================================
// ARCHIVO CENTRAL DE MODELOS - RESTAURANTES SERVICE
// ============================================================
// Este archivo centraliza:
// 1. Importación de todos los modelos
// 2. Definición de todas las relaciones (associations)
// 3. Exportación unificada
//
// Patrón: Index Centralizado con Separación de Responsabilidades
// Basado en: CONTEXTOMODELS.md
// ============================================================

// ============================================================
// IMPORTAR SEQUELIZE
// ============================================================
const { sequelize } = require('../config/database');

// ============================================================
// IMPORTAR TODOS LOS MODELOS
// ============================================================

// Restaurantes
const Restaurante = require('./restaurantes/restaurante.model');
const HorarioRestaurante = require('./restaurantes/horario-restaurante.model');
const HistorialRestaurante = require('./restaurantes/historial-restaurante.model');

// Productos
const TipoProducto = require('./productos/tipo-producto.model');
const Producto = require('./productos/producto.model');
const HistorialPreciosProducto = require('./productos/historial-precios-producto.model');

// Combos
const TipoCombo = require('./combos/tipo-combo.model');
const Combo = require('./combos/combo.model');
const ComboProducto = require('./combos/combo-producto.model');

// Pedidos
const EstadoPedido = require('./pedidos/estado-pedido.model');
const Pedido = require('./pedidos/pedido.model');
const DetallePedido = require('./pedidos/detalle-pedido.model');
const HistorialEstadosPedido = require('./pedidos/historial-estados-pedido.model');
const CancelacionPedido = require('./pedidos/cancelacion-pedido.model');

// ============================================================
// DEFINIR RELACIONES (ASSOCIATIONS)
// ============================================================

// ==================== MÓDULO: RESTAURANTES ====================

// Restaurante <-> HorarioRestaurante (1:N)
Restaurante.hasMany(HorarioRestaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'horarios' 
});
HorarioRestaurante.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});

// Restaurante <-> HistorialRestaurante (1:N)
Restaurante.hasMany(HistorialRestaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'historial' 
});
HistorialRestaurante.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});

// ==================== MÓDULO: PRODUCTOS ====================

// Restaurante <-> Producto (1:N)
Restaurante.hasMany(Producto, { 
  foreignKey: 'restaurante_id', 
  as: 'productos' 
});
Producto.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});

// TipoProducto <-> Producto (1:N)
TipoProducto.hasMany(Producto, { 
  foreignKey: 'tipo_producto_id', 
  as: 'productos' 
});
Producto.belongsTo(TipoProducto, { 
  foreignKey: 'tipo_producto_id', 
  as: 'tipo' 
});

// Producto <-> HistorialPreciosProducto (1:N)
Producto.hasMany(HistorialPreciosProducto, { 
  foreignKey: 'producto_id', 
  as: 'historial_precios' 
});
HistorialPreciosProducto.belongsTo(Producto, { 
  foreignKey: 'producto_id', 
  as: 'producto' 
});

// ==================== MÓDULO: COMBOS ====================

// Restaurante <-> Combo (1:N)
Restaurante.hasMany(Combo, { 
  foreignKey: 'restaurante_id', 
  as: 'combos' 
});
Combo.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});

// TipoCombo <-> Combo (1:N)
TipoCombo.hasMany(Combo, { 
  foreignKey: 'tipo_combo_id', 
  as: 'combos' 
});
Combo.belongsTo(TipoCombo, { 
  foreignKey: 'tipo_combo_id', 
  as: 'tipo' 
});

// Combo <-> ComboProducto <-> Producto (N:M a través de tabla intermedia)
Combo.hasMany(ComboProducto, { 
  foreignKey: 'combo_id', 
  as: 'combo_productos' 
});
ComboProducto.belongsTo(Combo, { 
  foreignKey: 'combo_id', 
  as: 'combo' 
});

Producto.hasMany(ComboProducto, { 
  foreignKey: 'producto_id', 
  as: 'combo_productos' 
});
ComboProducto.belongsTo(Producto, { 
  foreignKey: 'producto_id', 
  as: 'producto' 
});

// Relación directa N:M usando belongsToMany (opcional, para queries más simples)
Combo.belongsToMany(Producto, {
  through: ComboProducto,
  foreignKey: 'combo_id',
  otherKey: 'producto_id',
  as: 'productos'
});

Producto.belongsToMany(Combo, {
  through: ComboProducto,
  foreignKey: 'producto_id',
  otherKey: 'combo_id',
  as: 'combos'
});

// ==================== MÓDULO: PEDIDOS ====================

// Restaurante <-> Pedido (1:N)
Restaurante.hasMany(Pedido, { 
  foreignKey: 'restaurante_id', 
  as: 'pedidos' 
});
Pedido.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});

// EstadoPedido <-> Pedido (1:N)
EstadoPedido.hasMany(Pedido, { 
  foreignKey: 'estado_id', 
  as: 'pedidos' 
});
Pedido.belongsTo(EstadoPedido, { 
  foreignKey: 'estado_id', 
  as: 'estado' 
});

// Pedido <-> DetallePedido (1:N)
Pedido.hasMany(DetallePedido, { 
  foreignKey: 'pedido_id', 
  as: 'detalles' 
});
DetallePedido.belongsTo(Pedido, { 
  foreignKey: 'pedido_id', 
  as: 'pedido' 
});

// Producto <-> DetallePedido (1:N)
Producto.hasMany(DetallePedido, { 
  foreignKey: 'producto_id', 
  as: 'detalles_pedido' 
});
DetallePedido.belongsTo(Producto, { 
  foreignKey: 'producto_id', 
  as: 'producto' 
});

// Combo <-> DetallePedido (1:N)
Combo.hasMany(DetallePedido, { 
  foreignKey: 'combo_id', 
  as: 'detalles_pedido' 
});
DetallePedido.belongsTo(Combo, { 
  foreignKey: 'combo_id', 
  as: 'combo' 
});

// Pedido <-> HistorialEstadosPedido (1:N)
Pedido.hasMany(HistorialEstadosPedido, { 
  foreignKey: 'pedido_id', 
  as: 'historial_estados' 
});
HistorialEstadosPedido.belongsTo(Pedido, { 
  foreignKey: 'pedido_id', 
  as: 'pedido' 
});

// EstadoPedido <-> HistorialEstadosPedido (1:N)
EstadoPedido.hasMany(HistorialEstadosPedido, { 
  foreignKey: 'estado_id', 
  as: 'historial' 
});
HistorialEstadosPedido.belongsTo(EstadoPedido, { 
  foreignKey: 'estado_id', 
  as: 'estado' 
});

// Pedido <-> CancelacionPedido (1:1)
Pedido.hasOne(CancelacionPedido, { 
  foreignKey: 'pedido_id', 
  as: 'cancelacion' 
});
CancelacionPedido.belongsTo(Pedido, { 
  foreignKey: 'pedido_id', 
  as: 'pedido' 
});

// ============================================================
// EXPORTAR SEQUELIZE Y TODOS LOS MODELOS
// ============================================================

module.exports = {
  sequelize,
  
  // Restaurantes
  Restaurante,
  HorarioRestaurante,
  HistorialRestaurante,
  
  // Productos
  TipoProducto,
  Producto,
  HistorialPreciosProducto,
  
  // Combos
  TipoCombo,
  Combo,
  ComboProducto,
  
  // Pedidos
  EstadoPedido,
  Pedido,
  DetallePedido,
  HistorialEstadosPedido,
  CancelacionPedido
};
