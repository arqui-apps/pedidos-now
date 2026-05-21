# Tests Postman — Módulo Pedidos (cancelacion, estado, detalle)

**Fecha:** 2026-03-11

---

## ¿Qué se hizo?

Se generó el script `create-dirs.js` (en la raíz del servicio) que crea automáticamente la carpeta `postman-tests/pedidos/` con tres subcarpetas y sus archivos de test JSON, siguiendo el mismo formato que los tests existentes de `restaurantes/`, `productos/` y `horarios/`.

### Ejecutar una sola vez

```bash
node create-dirs.js
# o bien:
npm run postman:setup
```

---

## Estructura generada

```
postman-tests/
└── pedidos/
    ├── README.md
    ├── estados-pedido/
    │   ├── 01-listar-estados.json
    │   ├── 02-obtener-estado.json
    │   ├── 03-crear-estado.json
    │   ├── 04-actualizar-estado.json
    │   └── 05-eliminar-estado.json
    ├── detalle-pedido/
    │   ├── 01-listar-detalles.json
    │   ├── 02-obtener-detalle.json
    │   ├── 03-agregar-item-producto.json
    │   ├── 04-agregar-item-combo.json
    │   ├── 05-actualizar-detalle.json
    │   └── 06-eliminar-detalle.json
    └── cancelacion-pedido/
        ├── 01-listar-cancelaciones.json
        ├── 02-obtener-cancelacion.json
        ├── 03-cancelacion-por-pedido.json
        ├── 04-cancelar-por-cliente.json
        ├── 05-cancelar-por-restaurante.json
        └── 06-errores-cancelacion.json
```

---

## Endpoints cubiertos

### Estados de Pedido (`/api/estados-pedido`)

| Método | Ruta | Archivo |
|--------|------|---------|
| GET | `/api/estados-pedido` | `01-listar-estados.json` |
| GET | `/api/estados-pedido/:id` | `02-obtener-estado.json` |
| POST | `/api/estados-pedido` | `03-crear-estado.json` |
| PUT | `/api/estados-pedido/:id` | `04-actualizar-estado.json` |
| DELETE | `/api/estados-pedido/:id` | `05-eliminar-estado.json` |

### Detalle de Pedido (`/api/pedidos/:pedido_id/detalles`)

| Método | Ruta | Archivo |
|--------|------|---------|
| GET | `/api/pedidos/:pedido_id/detalles` | `01-listar-detalles.json` |
| GET | `/api/pedidos/:pedido_id/detalles/:id` | `02-obtener-detalle.json` |
| POST | `/api/pedidos/:pedido_id/detalles` (producto) | `03-agregar-item-producto.json` |
| POST | `/api/pedidos/:pedido_id/detalles` (combo) | `04-agregar-item-combo.json` |
| PUT | `/api/pedidos/:pedido_id/detalles/:id` | `05-actualizar-detalle.json` |
| DELETE | `/api/pedidos/:pedido_id/detalles/:id` | `06-eliminar-detalle.json` |

### Cancelación de Pedido

| Método | Ruta | Archivo |
|--------|------|---------|
| GET | `/api/pedidos/cancelaciones` | `01-listar-cancelaciones.json` |
| GET | `/api/pedidos/cancelaciones/:id` | `02-obtener-cancelacion.json` |
| GET | `/api/pedidos/:pedido_id/cancelacion` | `03-cancelacion-por-pedido.json` |
| POST | `/api/pedidos/:pedido_id/cancelacion/cancelar` | `04-cancelar-por-cliente.json` |
| POST | `/api/pedidos/:pedido_id/cancelacion/cancelar` | `05-cancelar-por-restaurante.json` |
| — | Casos de error documentados | `06-errores-cancelacion.json` |

---

## Lógica de multas documentada

| Actor | Porcentaje | Estados que activan multa |
|-------|-----------|--------------------------|
| `cliente` | 5% del total | `preparando` (3), `listo` (4), `en_camino` (5) |
| `restaurante` | 10% del total | `confirmado` (2), `preparando` (3), `listo` (4), `en_camino` (5) |

---

## Formato de los archivos

Cada JSON sigue la misma estructura del resto de la carpeta `postman-tests/`:

```json
{
  "endpoint": "METHOD http://localhost:3000/api/...",
  "descripcion": "...",
  "headers": {},
  "body": {},
  "respuesta_esperada": {},
  "notas": []
}
```

Los archivos con múltiples escenarios incluyen también `caso_error_*` o `escenario_*` dentro del mismo JSON.
