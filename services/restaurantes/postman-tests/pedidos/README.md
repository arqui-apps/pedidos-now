# Tests Postman — Módulo Pedidos

Base URL: `http://localhost:3000/api`

## 📁 Estructura

### `estados-pedido/`
Operaciones CRUD sobre los estados del ciclo de vida de un pedido.

| Archivo | Método | Endpoint |
|---|---|---|
| 01-listar-estados.json | GET | /api/estados-pedido |
| 02-obtener-estado.json | GET | /api/estados-pedido/:id |
| 03-crear-estado.json | POST | /api/estados-pedido |
| 04-actualizar-estado.json | PUT | /api/estados-pedido/:id |
| 05-eliminar-estado.json | DELETE | /api/estados-pedido/:id |

### `detalle-pedido/`
Gestión de ítems (productos/combos) dentro de un pedido. Las rutas son anidadas bajo `/pedidos/:pedido_id/detalles`.

| Archivo | Método | Endpoint |
|---|---|---|
| 01-listar-detalles.json | GET | /api/pedidos/:pedido_id/detalles |
| 02-obtener-detalle.json | GET | /api/pedidos/:pedido_id/detalles/:id |
| 03-agregar-item-producto.json | POST | /api/pedidos/:pedido_id/detalles |
| 04-agregar-item-combo.json | POST | /api/pedidos/:pedido_id/detalles |
| 05-actualizar-detalle.json | PUT | /api/pedidos/:pedido_id/detalles/:id |
| 06-eliminar-detalle.json | DELETE | /api/pedidos/:pedido_id/detalles/:id |

### `cancelacion-pedido/`
Registro y consulta de cancelaciones. Incluye lógica de multas.

| Archivo | Método | Endpoint |
|---|---|---|
| 01-listar-cancelaciones.json | GET | /api/pedidos/cancelaciones |
| 02-obtener-cancelacion.json | GET | /api/pedidos/cancelaciones/:id |
| 03-cancelacion-por-pedido.json | GET | /api/pedidos/:pedido_id/cancelacion |
| 04-cancelar-por-cliente.json | POST | /api/pedidos/:pedido_id/cancelacion/cancelar |
| 05-cancelar-por-restaurante.json | POST | /api/pedidos/:pedido_id/cancelacion/cancelar |
| 06-errores-cancelacion.json | — | Casos de error documentados |

## 💡 Lógica de multas

| Actor | Multa | Estados que la activan |
|---|---|---|
| Cliente | 5% del total | preparando (3), listo (4), en_camino (5) |
| Restaurante | 10% del total | confirmado (2), preparando (3), listo (4), en_camino (5) |
