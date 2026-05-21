// ============================================================
// ARCHIVO CENTRAL DE MODELOS - MÓDULO LOGÍSTICA
// ============================================================
// Este archivo centraliza la importación de todos los modelos,
// define sus relaciones y los exporta para uso en controladores

const { sequelize } = require('../config/database');

// ============================================================
// IMPORTAR TODOS LOS MODELOS
// ============================================================

// Modelos de Categorías
const CategoriaOrden = require('./categorias/categoria-orden.model');

// Modelos de Repartidores
const Repartidor = require('./repartidores/repartidor.model');

// Modelos de Logística
const Entrega = require('./entregas/entrega.model');
const AsignacionEntrega = require('./asignaciones/asignacion-entrega.model');
const HistorialEstadoEntrega = require('./historial/historial-estado.model');
const IncidenciaEntrega = require('./incidencias/incidencia.model');

// Modelos de Ubicaciones
const HistorialUbicacionRepartidor = require('./ubicaciones/historial-ubicacion-repartidor.model');

// Modelos de Notificaciones
const NotificacionLogistica = require('./notificaciones/notificacion-logistica.model');

// Modelos de Calificaciones
const CalificacionEntrega = require('./calificaciones/calificacion-entrega.model');

// ============================================================
// DEFINIR RELACIONES (ASSOCIATIONS)
// ============================================================

// ==================== MÓDULO: CATEGORÍAS ====================

// Entrega <-> CategoriaOrden (N:1)
Entrega.belongsTo(CategoriaOrden, { 
    foreignKey: 'categoria_id', 
    as: 'categoria' 
});
CategoriaOrden.hasMany(Entrega, { 
    foreignKey: 'categoria_id', 
    as: 'entregas' 
});

// ==================== MÓDULO: ENTREGAS ====================

// Entrega <-> HistorialEstadoEntrega (1:N)
Entrega.hasMany(HistorialEstadoEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'historial' 
});
HistorialEstadoEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// ==================== MÓDULO: ASIGNACIONES ====================

// Entrega <-> AsignacionEntrega (1:N)
Entrega.hasMany(AsignacionEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'asignaciones' 
});
AsignacionEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// Repartidor <-> AsignacionEntrega (1:N)
Repartidor.hasMany(AsignacionEntrega, { 
    foreignKey: 'repartidor_id', 
    as: 'asignaciones' 
});
AsignacionEntrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// ==================== MÓDULO: INCIDENCIAS ====================

// Entrega <-> IncidenciaEntrega (1:N)
Entrega.hasMany(IncidenciaEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'incidencias' 
});
IncidenciaEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// Repartidor <-> IncidenciaEntrega (1:N)
Repartidor.hasMany(IncidenciaEntrega, { 
    foreignKey: 'repartidor_id', 
    as: 'incidencias_reportadas' 
});
IncidenciaEntrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// ==================== MÓDULO: UBICACIONES ====================

// Repartidor <-> HistorialUbicacionRepartidor (1:N)
Repartidor.hasMany(HistorialUbicacionRepartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'ubicaciones' 
});
HistorialUbicacionRepartidor.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// Entrega <-> HistorialUbicacionRepartidor (1:N)
Entrega.hasMany(HistorialUbicacionRepartidor, { 
    foreignKey: 'entrega_id', 
    as: 'ubicaciones_repartidor' 
});
HistorialUbicacionRepartidor.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// ==================== MÓDULO: NOTIFICACIONES ====================

// Entrega <-> NotificacionLogistica (1:N)
Entrega.hasMany(NotificacionLogistica, { 
    foreignKey: 'entrega_id', 
    as: 'notificaciones' 
});
NotificacionLogistica.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// ==================== MÓDULO: CALIFICACIONES ====================

// Entrega <-> CalificacionEntrega (1:1)
Entrega.hasOne(CalificacionEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'calificacion' 
});
CalificacionEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// Repartidor <-> CalificacionEntrega (1:N)
Repartidor.hasMany(CalificacionEntrega, { 
    foreignKey: 'repartidor_id', 
    as: 'calificaciones' 
});
CalificacionEntrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// Repartidor <-> HistorialEstadoEntrega (1:N)
Repartidor.hasMany(HistorialEstadoEntrega, { 
    foreignKey: 'repartidor_id', 
    as: 'historial_estados' 
});
HistorialEstadoEntrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// ============================================================
// EXPORTAR SEQUELIZE Y TODOS LOS MODELOS
// ============================================================

module.exports = {
    sequelize,
    
    // Modelos de Categorías
    CategoriaOrden,
    
    // Modelos de Repartidores
    Repartidor,
    
    // Modelos de Logística
    Entrega,
    AsignacionEntrega,
    HistorialEstadoEntrega,
    IncidenciaEntrega,
    
    // Modelos de Ubicaciones
    HistorialUbicacionRepartidor,
    
    // Modelos de Notificaciones
    NotificacionLogistica,
    
    // Modelos de Calificaciones
    CalificacionEntrega
};
