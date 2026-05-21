# 📦 MODELOS SEQUELIZE - LOGÍSTICA

## Estructura

Este directorio contiene todos los modelos Sequelize del módulo de Logística, organizados por dominio funcional.

```
models/
├── index.js                      ⭐ Archivo central (relaciones)
├── repartidores/
│   ├── repartidor.model.js
│   ├── estado-operativo-repartidor.model.js
│   └── index.js
├── entregas/
│   ├── entrega.model.js
│   └── index.js
├── asignaciones/
│   ├── asignacion-entrega.model.js
│   └── index.js
├── historial/
│   ├── historial-estado.model.js
│   └── index.js
└── incidencias/
    ├── incidencia.model.js
    └── index.js
```

## Uso

### Importar modelos:

```javascript
// Importar desde el index central
const {
    Repartidor,
    EstadoOperativoRepartidor,
    Entrega,
    AsignacionEntrega,
    HistorialEstadoEntrega,
    IncidenciaEntrega
} = require('./models');
```

### Ejemplo CRUD:

```javascript
// CREATE
const entrega = await Entrega.create({
    tipo_origen: 'restaurante',
    origen_id: 123,
    empresa_id: 456,
    cliente_id: 789,
    direccion_entrega: 'Calle Principal 123',
    monto_cobrar: 45.50
});

// READ
const entrega = await Entrega.findByPk(1, {
    include: [
        { model: Repartidor, as: 'repartidor' },
        { model: HistorialEstadoEntrega, as: 'historial' }
    ]
});

// UPDATE
await Entrega.update(
    { estado_entrega: 'en_camino' },
    { where: { id_entrega: 1 } }
);

// DELETE (soft delete recomendado)
// await Entrega.destroy({ where: { id_entrega: 1 } });
```

## Patrón Arquitectura

- ✅ Cada `.model.js` define SOLO la estructura de datos
- ✅ NO se definen relaciones en archivos individuales
- ✅ Todas las relaciones en `index.js` central
- ✅ Exportación unificada

Ver: `../../context/CONTEXTOMODELS.md` para más detalles.
