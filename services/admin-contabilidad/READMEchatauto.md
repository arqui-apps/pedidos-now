# README Chat Automatizado - Administracion y Contabilidad

Este documento explica la integracion agregada en el microservicio `admin-contabilidad` para recibir, copiar y guardar la informacion generada por el microservicio `chat-automatizado`.

## Objetivo

El objetivo de esta integracion es simple:

- Recibir la informacion que mande `chat-automatizado`.
- Copiar esa informacion dentro de la base de datos de Administracion y Contabilidad.
- Guardar el registro completo para consultas futuras.
- Generar reportes por cliente usando la informacion recibida.

Este microservicio no decide nada del flujo del chat. No resuelve casos, no calcula respuestas, no modifica la conversacion y no reemplaza el trabajo del equipo de `chat-automatizado`.

Administracion solo conserva una copia de lo que el chat produjo.

## Que informacion se guarda

Se guarda informacion de:

- Sesiones del chat.
- Mensajes enviados durante la conversacion.
- Compensaciones generadas desde el chat.
- Solicitudes de soporte generadas desde el chat.
- Consultas realizadas desde el chat.
- Payload completo recibido en cada endpoint.

El payload completo se guarda para no perder informacion si `chat-automatizado` manda campos nuevos en el futuro.

## Archivos agregados o modificados

### `src/app.js`

Se registro la ruta principal:

```js
app.use('/api/chat-automatizado', chatAutomatizadoRoutes);
```

Esto activa todos los endpoints bajo:

```txt
/api/chat-automatizado
```

### `src/routes/chat_automatizado.routes.js`

Define los endpoints que recibe Administracion para copiar informacion del chat.

### `src/controller/chat_automatizado.controller.js`

Recibe las peticiones HTTP y llama al service correspondiente.

### `src/middleware/chat_automatizado.middleware.js`

Valida que el body recibido tenga los campos minimos necesarios.

### `src/services/chat_automatizado.service.js`

Normaliza los nombres de campos que vienen desde `chat-automatizado` y coordina el guardado.

Acepta nombres originales como:

```txt
id_session
id_usuario
id_mensaje
id_compensacion
id_support_request
id_inquiry
```

Y los transforma internamente a nombres usados por Administracion, como:

```txt
id_session_externo
id_usuario_externo
id_mensaje_externo
```

### `src/repositories/chat_automatizado.repository.js`

Hace los INSERT y UPDATE en MySQL.

Usa `ON DUPLICATE KEY UPDATE` para que si llega dos veces el mismo registro externo, se actualice y no se duplique.

### `src/sql/chat_automatizado.sql`

Contiene la creacion de tablas y vista para reportes.

### `src/sql/README.md`

Contiene documentacion tecnica corta sobre las tablas y endpoints.

## Tablas creadas

### `chat_sesion_resumen`

Guarda una copia del resumen de cada sesion del chatbot.

Campos importantes:

```txt
id_session_externo
id_usuario_externo
user_type
current_state
previous_state
chat_context
session_status
resolution
start_time
end_time
is_active
```

### `chat_mensaje_historial`

Guarda los mensajes de cada conversacion.

Campos importantes:

```txt
id_mensaje_externo
id_session_externo
message_sender
message_content
sent_time
is_active
```

### `chat_compensacion`

Guarda compensaciones generadas por el chat.

Campos importantes:

```txt
id_compensacion_externo
id_usuario_externo
id_session_externo
amount
cupon_code
expiration_date
reason
compensation_type
compensation_status
is_active
```

### `chat_support_request`

Guarda solicitudes de soporte generadas desde el chat.

Campos importantes:

```txt
id_support_request_externo
id_delivery_externo
id_pedido_externo
id_session_externo
id_problem_externo
request_status
problem_details
is_active
```

### `chat_order_inquiry`

Guarda consultas realizadas desde el chat.

Campos importantes:

```txt
id_inquiry_externo
id_session_externo
inquiry_type
input_value
inquiry_time
result_found
is_active
```

### `chat_payload_auditoria`

Guarda el JSON completo recibido.

Esta tabla es importante porque conserva todo lo que mando `chat-automatizado`, incluso campos que Administracion todavia no use directamente.

Campos importantes:

```txt
entity_type
external_id
id_session_externo
id_usuario_externo
raw_payload
received_at
```

## Vista de reporte

### `vw_chat_reporte_cliente`

Esta vista resume informacion por cliente y sesion.

Incluye:

```txt
id_usuario_externo
user_type
id_session_externo
current_state
session_status
resolution
start_time
end_time
minutos_resolucion
total_mensajes
total_compensaciones
monto_compensaciones
total_soporte
total_consultas
```

## Endpoints activos

Prefijo base:

```txt
http://localhost:3000/api/chat-automatizado
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

## Endpoint para guardar sesion

```txt
POST http://localhost:3000/api/chat-automatizado/sesiones
```

Ejemplo de body:

```json
{
  "id_session": 1,
  "id_usuario": 10,
  "user_type": "cliente",
  "current_state": "PROBLEMA_PEDIDO",
  "previous_state": "MENU_PRINCIPAL",
  "chat_context": {},
  "session_status": "active",
  "resolution": "resuelto",
  "start_time": "2026-04-15 10:00:00",
  "end_time": "2026-04-15 10:05:00",
  "is_active": 1
}
```

## Endpoint para guardar mensajes

```txt
POST http://localhost:3000/api/chat-automatizado/mensajes
```

Ejemplo de body:

```json
{
  "id_mensaje": 1,
  "id_session": 1,
  "message_sender": "cliente",
  "message_content": "Necesito ayuda con mi pedido",
  "sent_time": "2026-04-15 10:01:00",
  "is_active": 1
}
```

## Endpoint para guardar compensaciones

```txt
POST http://localhost:3000/api/chat-automatizado/compensaciones
```

Ejemplo de body:

```json
{
  "id_compensacion": 1,
  "id_usuario": 10,
  "id_session": 1,
  "amount": 25.00,
  "cupon_code": "CUPON25",
  "expiration_date": "2026-04-30 23:59:59",
  "reason": "Pedido con problema reportado desde chat",
  "compensation_type": "cupon",
  "compensation_status": "pendiente",
  "is_active": 1
}
```

## Endpoint para guardar soporte

```txt
POST http://localhost:3000/api/chat-automatizado/soporte
```

Ejemplo de body:

```json
{
  "id_support_request": 1,
  "id_delivery": 20,
  "id_pedido": 100,
  "id_session": 1,
  "id_problem": 2,
  "request_status": "pendiente",
  "problem_details": "El repartidor reporto un problema de entrega",
  "is_active": 1
}
```

## Endpoint para guardar consultas

```txt
POST http://localhost:3000/api/chat-automatizado/consultas
```

Ejemplo de body:

```json
{
  "id_inquiry": 1,
  "id_session": 1,
  "inquiry_type": "pedido",
  "input_value": "100",
  "inquiry_time": "2026-04-15 10:02:00",
  "result_found": 1,
  "is_active": 1
}
```

## Endpoint para guardar lote completo

```txt
POST http://localhost:3000/api/chat-automatizado/sync
```

Este endpoint permite guardar varios registros en una sola peticion.

Ejemplo de body:

```json
{
  "sesiones": [],
  "mensajes": [],
  "compensaciones": [],
  "soporte": [],
  "consultas": []
}
```

## Endpoint de resumen general

```txt
GET http://localhost:3000/api/chat-automatizado/resumen
```

Devuelve un resumen general de:

- Sesiones.
- Compensaciones.
- Soporte.
- Consultas.

## Endpoint de reportes por clientes

```txt
GET http://localhost:3000/api/chat-automatizado/reportes/clientes
```

Devuelve el resumen de sesiones por cliente usando la vista `vw_chat_reporte_cliente`.

## Endpoint de reporte de un cliente especifico

```txt
GET http://localhost:3000/api/chat-automatizado/reportes/clientes/:id_usuario
```

Ejemplo:

```txt
GET http://localhost:3000/api/chat-automatizado/reportes/clientes/10
```

Devuelve:

- Sesiones del cliente.
- Mensajes de cada sesion.
- Compensaciones asociadas.
- Solicitudes de soporte asociadas.
- Consultas asociadas.
- Payloads completos recibidos.

## Configuracion de base de datos

El archivo `.env` local debe tener una conexion como esta:

```env
MYSQL_URL=mysql://root:1191@localhost:3306/admin_conta
PORT=3000
```

El archivo `.env.example` no debe contener una contrasena real. Debe usar placeholder:

```env
MYSQL_URL=mysql://root:TU_PASSWORD@localhost:3306/admin_conta
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD
DB_NAME=admin_conta
```

## Crear tablas en MySQL Workbench

Ejecutar primero:

```sql
CREATE DATABASE IF NOT EXISTS admin_conta
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE admin_conta;
```

Luego abrir el archivo:

```txt
services/admin-contabilidad/src/sql/chat_automatizado.sql
```

Pegar todo el contenido en MySQL Workbench y ejecutarlo completo.

## Verificar tablas

```sql
USE admin_conta;

SHOW TABLES LIKE 'chat_%';
```

Deben existir:

```txt
chat_compensacion
chat_mensaje_historial
chat_order_inquiry
chat_payload_auditoria
chat_sesion_resumen
chat_support_request
```

Tambien debe existir la vista:

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

Debe aparecer:

```txt
vw_chat_reporte_cliente
```

## Prueba rapida

Levantar el servicio:

```powershell
cd "C:\Users\Andrei Harkov Lev\pedidos-now\services\admin-contabilidad"
npm start
```

Probar endpoint base:

```txt
GET http://localhost:3000/
```

Probar guardado de sesion:

```txt
POST http://localhost:3000/api/chat-automatizado/sesiones
```

Verificar en MySQL:

```sql
SELECT * FROM chat_sesion_resumen;
SELECT * FROM chat_payload_auditoria;
```

## Resultado final

Con esto Administracion y Contabilidad queda lista para recibir la informacion de `chat-automatizado`, copiarla en MySQL y generar reportes por cliente.

La responsabilidad de este modulo termina en guardar y reportar la informacion recibida.