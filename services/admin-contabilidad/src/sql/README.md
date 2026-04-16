# Integracion Chat Automatizado en Administracion

Esta integracion solo guarda informacion recibida desde `chat-automatizado` para que Administracion y Contabilidad pueda generar reportes por cliente.

No ejecuta flujos de chat, no resuelve casos y no calcula decisiones del chatbot. Su unica responsabilidad es copiar y conservar lo que `chat-automatizado` envie.

## Que se guarda

Se guarda la informacion normalizada en tablas separadas y tambien el payload completo recibido.

Esto permite dos cosas:

- Consultar reportes ordenados por cliente, sesion, mensajes, soporte, consultas y compensaciones.
- Conservar una copia exacta del JSON recibido aunque el otro equipo agregue campos nuevos despues.

## Archivos agregados

- `src/controller/chat_automatizado.controller.js`
  - Recibe las peticiones HTTP y devuelve respuestas JSON.

- `src/middleware/chat_automatizado.middleware.js`
  - Valida que cada endpoint reciba los campos minimos necesarios.

- `src/services/chat_automatizado.service.js`
  - Normaliza nombres de campos que vienen de chat, por ejemplo `id_session`, `id_usuario`, `id_mensaje`.
  - Guarda cada registro junto con su payload completo.

- `src/repositories/chat_automatizado.repository.js`
  - Inserta o actualiza la informacion en MySQL.
  - Consulta reportes por cliente.

- `src/routes/chat_automatizado.routes.js`
  - Expone los endpoints bajo `/api/chat-automatizado`.

- `src/sql/chat_automatizado.sql`
  - Crea las tablas y la vista de reporte.

## Tablas

- `chat_sesion_resumen`
  - Copia el resumen de cada sesion de chat.

- `chat_mensaje_historial`
  - Copia los mensajes enviados en la conversacion.

- `chat_compensacion`
  - Copia las compensaciones generadas desde chat.

- `chat_support_request`
  - Copia solicitudes de soporte generadas desde chat.

- `chat_order_inquiry`
  - Copia consultas realizadas desde chat.

- `chat_payload_auditoria`
  - Guarda el JSON completo recibido en cada endpoint.
  - Esta tabla es la garantia de que Administracion conserva toda la informacion que mande `chat-automatizado`.

## Vista de reporte

- `vw_chat_reporte_cliente`
  - Resume sesiones por cliente.
  - Incluye totales de mensajes, compensaciones, soporte y consultas por sesion.

## Endpoints activos

Prefijo base:

```txt
/api/chat-automatizado
```

Endpoints:

```txt
POST /api/chat-automatizado/sesiones
POST /api/chat-automatizado/mensajes
POST /api/chat-automatizado/compensaciones
POST /api/chat-automatizado/soporte
POST /api/chat-automatizado/consultas
POST /api/chat-automatizado/sync
GET  /api/chat-automatizado/resumen
GET  /api/chat-automatizado/reportes/clientes
GET  /api/chat-automatizado/reportes/clientes/:id_usuario
```

## Endpoint principal para reporte de cliente

```txt
GET /api/chat-automatizado/reportes/clientes/:id_usuario
```

Ejemplo:

```txt
GET http://localhost:3000/api/chat-automatizado/reportes/clientes/10
```

Devuelve:

- Datos de sesiones del cliente.
- Mensajes de cada sesion.
- Compensaciones asociadas.
- Solicitudes de soporte asociadas.
- Consultas asociadas.
- Payloads completos recibidos desde `chat-automatizado`.

## SQL necesario

Ejecutar en MySQL Workbench:

```sql
USE admin_conta;
SOURCE C:/Users/Andrei Harkov Lev/pedidos-now/services/admin-contabilidad/src/sql/chat_automatizado.sql;
```

Si Workbench no acepta `SOURCE`, abrir el archivo `src/sql/chat_automatizado.sql`, pegarlo en una pestana SQL y ejecutarlo completo.

## Nota importante

Si ya habias ejecutado una version anterior del SQL, vuelve a ejecutar `chat_automatizado.sql` para crear la tabla `chat_payload_auditoria` y la vista `vw_chat_reporte_cliente`.