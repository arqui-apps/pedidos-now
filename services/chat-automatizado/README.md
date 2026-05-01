# Chat Automatizado — Servicio al Cliente

Microservicio de atención al cliente automatizado para la plataforma Pedidos Now.  
Implementado con Node.js, XState y MySQL. Resuelve casos de clientes, repartidores y negocios sin intervención humana.

**URL de producción:** `https://pedidos-now-chat-automatizado.up.railway.app`

---

## Tecnologías

- **Node.js 22** + Express 5 (ES Modules)
- **XState 5** — máquina de estados finitos para el flujo del bot
- **MySQL 8** + Sequelize ORM
- **Axios** — llamadas a servicios externos con fallback mock automático

---

## Requisitos previos

- Node.js 22+
- MySQL 8 corriendo localmente

---

## Instalación local

```bash
# 1. Clonar el repositorio y posicionarse en la carpeta
cd chat-automatizado

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# 4. Crear tablas y datos iniciales
npm run setup

# 5. Iniciar en modo desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3004`.

---

## Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
PORT=3004
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chatbot

# URLs de servicios externos (dejar en localhost si no están disponibles — el bot usa mocks automáticamente)
AUTH_SERVICE_URL=http://localhost:3001
RESTAURANTS_SERVICE_URL=http://localhost:3002
NEGOCIOS_SERVICE_URL=http://localhost:3003
PAQUETERIA_SERVICE_URL=http://localhost:3007
DESCUENTOS_SERVICE_URL=http://localhost:3005
COBROS_SERVICE_URL=http://localhost:3006
```

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload (nodemon) |
| `npm start` | Servidor en producción |
| `npm run migrate` | Ejecutar migraciones de BD |
| `npm run migrate:undo` | Revertir última migración |
| `npm run seed` | Cargar datos iniciales (menús, FAQs, catálogos) |
| `npm run setup` | migrate + seed en un solo comando |
| `npm test` | Suite principal (95 pruebas) |
| `npm run test:escalation` | Suite de escalación (40 pruebas) |
| `npm run test:all` | Ambas suites en secuencia |

---

## Endpoints principales

### Health check
```
GET /health
```
Retorna el estado de la base de datos y de cada servicio externo.

### Sesión (flujo del bot)
```
POST   /session                  Iniciar sesión
POST   /session/message          Enviar mensaje al bot
GET    /session/:id              Estado actual de sesión
GET    /session/:id/history      Historial completo de mensajes
PATCH  /session/:id/close        Cerrar sesión manualmente
```

### FAQs
```
GET    /support/api/faqs              Listar FAQs (filtros: category_type, search)
GET    /support/api/faqs/:id          Obtener una FAQ
POST   /support/api/faqs              Crear FAQ
PATCH  /support/api/faqs/:id          Actualizar FAQ
DELETE /support/api/faqs/:id          Desactivar FAQ
```

### Compensaciones
```
GET /compensation                      Listar compensaciones
GET /compensation/:id                  Obtener una compensación
GET /compensation/validate/:code       Validar vigencia de cupón
```

### Escalación al módulo de agentes
```
GET   /escalation                      Listar casos escalados
GET   /escalation/:id                  Payload completo del caso
GET   /escalation/session/:id_session  Buscar por sesión (endpoint para el Broker)
PATCH /escalation/:id/status           Actualizar estado del handoff
```

### Otros
```
GET /support         Solicitudes de soporte (repartidores en carretera)
GET /message         Mensajes de una sesión (?id_session=X)
GET /inquiry         Consultas de pedidos registradas
GET /menu            Menús del bot (?user_type=cliente|repartidor|negocio)
```

---

## Flujo básico de integración para UI

```
1. POST /session          → recibir id_session y primer mensaje del bot
2. POST /session/message  → enviar input del usuario (número de opción o código)
3. Verificar is_final     → si true, la conversación terminó
4. Si state = ESCALAR_AGENTE → pasar escalation_payload al módulo de agentes
```

**Tipos de usuario válidos:** `cliente`, `repartidor`, `negocio`

**Ejemplo de inicio de sesión:**
```json
POST /session
{
  "id_usuario": 1,
  "user_type": "cliente"
}
```

**Ejemplo de envío de opción:**
```json
POST /session/message
{
  "id_session": 1,
  "input": "1"
}
```

**Ejemplo de envío de código de pedido:**
```json
POST /session/message
{
  "id_session": 1,
  "input": "PED-001",
  "input_type": "INPUT_CODE"
}
```

---

## Casos que el bot resuelve automáticamente

| Usuario | Problema | Resolución |
|---|---|---|
| Cliente | Pedido no llegó o incompleto | Cupón de compensación |
| Cliente | Pedido llegó en mal estado | Reembolso |
| Cliente | Cobro duplicado | Reembolso |
| Repartidor | Necesita apoyo en carretera | Solicitud de soporte registrada |
| Negocio | Cancelar pedido | Cancelación con confirmación |

## Casos que escalan al módulo de agentes

| Usuario | Problema | Categoría |
|---|---|---|
| Cliente | Problema desconocido | `problema_pedido_desconocido` |
| Cliente | Cargo no reconocido | `cargo_no_reconocido` |
| Repartidor | Cliente no responde | `cliente_no_responde` |
| Repartidor | Dirección incorrecta | `direccion_incorrecta` |
| Negocio | Problema de cobro | `problema_cobro_negocio` |

---

## Payload de escalación

Cuando el bot escala un caso, la respuesta de `POST /session/message` incluye el campo `escalation_payload` con:

```json
{
  "id_escalation": 1,
  "id_session": 7,
  "id_usuario": 51,
  "user_type": "cliente",
  "problem_category": "cargo_no_reconocido",
  "previous_state": "PROBLEMA_COBRO",
  "summary": "Resumen del caso para el agente...",
  "conversation_history": [...],
  "context_data": { "order_code": null, "total_messages": 5 },
  "handoff_status": "pendiente"
}
```

El módulo de agentes puede consultar este payload en cualquier momento con:
```
GET /escalation/session/:id_session
```

---

## Integración con otros servicios

El chatbot funciona de forma independiente con mocks. Cuando un servicio externo está disponible, actualizar la variable de entorno correspondiente — no se requiere ningún cambio en el código.

| Servicio | Variable | Endpoint requerido |
|---|---|---|
| Auth | `AUTH_SERVICE_URL` | `GET /users/:id` |
| Restaurantes | `RESTAURANTS_SERVICE_URL` | `GET /orders/:code` |
| Negocios | `NEGOCIOS_SERVICE_URL` | `POST /orders/:code/cancel` |
| Descuentos | `DESCUENTOS_SERVICE_URL` | `POST /coupons/compensation` |
| Cobros | `COBROS_SERVICE_URL` | `POST /refunds` |

---

## Pruebas

Con el servidor corriendo en `localhost:3004`:

```bash
npm test                  # 95 pruebas — flujos completos del bot
npm run test:escalation   # 40 pruebas — sistema de escalación
npm run test:all          # 135 pruebas en total
```

---

## Estructura del proyecto

```
chat-automatizado/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── env.cjs
│   ├── controllers/          8 controllers
│   ├── routes/               8 archivos de rutas
│   ├── services/
│   │   ├── chat.Service.js   núcleo del bot
│   │   ├── escalation.service.js
│   │   └── external/         auth, pedidos, descuentos, cobros, bancario
│   ├── machines/
│   │   ├── chatMachine.js
│   │   ├── guards.js
│   │   └── states/           clienteStates, repartidorStates, negocioStates
│   ├── middlewares/          errorHandler, validateRequest
│   ├── models/               8 modelos Sequelize
│   └── tests/                archivos de prueba
├── migrations/               13 migraciones
├── seeders/                  4 seeders
├── config/
│   └── config.cjs
└── postman/                  colecciones Postman
```


