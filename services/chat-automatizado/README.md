# Chat Automatizado — Servicio al Cliente

Microservicio de atención al cliente automatizado para la plataforma **Pedidos Now**.
Implementado con Node.js, XState y MySQL. Resuelve casos de clientes, repartidores y negocios sin intervención humana. Cuando no puede resolver, escala automáticamente a un agente humano.

**URL de producción:** `https://pedidos-now-chat-automatizado.up.railway.app`  
**Documentación Swagger:** `https://pedidos-now-chat-automatizado.up.railway.app/api-docs`  
**Vía Broker:** `https://broker-services-production.up.railway.app/api/soporte/`

---

## Tecnologías

- **Node.js 22** + Express 5 (ES Modules)
- **XState 5** — máquina de estados finitos para el flujo del bot
- **MySQL 8** + Sequelize ORM
- **Pino** — logging estructurado profesional
- **Swagger UI** — documentación interactiva de la API
- **Jest + Supertest** — tests de integración
- **Axios** — llamadas a servicios externos con fallback automático

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
# Editar .env con tus credenciales de base de datos y URLs de servicios

# 4. Crear tablas y datos iniciales
npm run migrate
npm run seed

# 5. Iniciar en modo desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3004`.  
La documentación Swagger en `http://localhost:3004/api-docs`.

---

## Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
PORT=3004
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chatbot_service

# Servicios externos
AUTH_SERVICE_URL=https://broker-services-production.up.railway.app
RESTAURANTS_SERVICE_URL=https://restaurantes.fly.dev/api
CHAT_SAC_URL=https://pedidos-now-production-c4cf.up.railway.app
DESCUENTOS_SERVICE_URL=http://157.245.138.186:3001
COBROS_SERVICE_URL=https://cobros-api.fly.dev
LOGISTICA_SERVICE_URL=https://modulo-logistica.fly.dev
BROKER_URL=https://broker-services-production.up.railway.app
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
| `npm test` | Suite principal de pruebas |
| `npm run test:escalation` | Suite de escalación |
| `npm run test:all` | Ambas suites en secuencia |

---

## Documentación de la API

La documentación interactiva está disponible en Swagger UI:

```
http://localhost:3004/api-docs        (local)
https://pedidos-now-chat-automatizado.up.railway.app/api-docs  (producción)
```

Desde Swagger puedes explorar y probar todos los endpoints directamente desde el navegador.

---

## Endpoints principales

### Health check
```
GET /health
```
Retorna el estado del servicio y la base de datos.

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
GET   /escalation/session/:id_session  Buscar por sesión (para el Broker)
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
| Cliente | Pedido no llegó o incompleto | Cupón de compensación real (Descuentos API) |
| Cliente | Pedido llegó en mal estado | Reembolso real (Cobros API) |
| Cliente | Cobro duplicado | Reembolso real (Cobros API) |
| Repartidor | Necesita apoyo en carretera | Solicitud de soporte registrada en BD |
| Negocio | Cancelar pedido | Cancelación con confirmación vía Logística |

## Casos que escalan al módulo de agentes

| Usuario | Problema | Categoría |
|---|---|---|
| Cliente | Problema desconocido | `problema_pedido_desconocido` |
| Cliente | Cargo no reconocido | `cargo_no_reconocido` |
| Repartidor | Cliente no responde | `cliente_no_responde` |
| Repartidor | Dirección incorrecta | `direccion_incorrecta` |
| Negocio | Problema de cobro | `problema_cobro_negocio` |

---


### Flujo de reembolso real
```
Usuario reporta problema con PED-8
       ↓
Logística → identifica módulo origen (restaurante/negocio)
       ↓
Restaurantes → obtiene cobro_id del pedido
       ↓
Cobros → POST /payments/:cobro_id/refund → PARTIALLY_REFUNDED ✅
```

### Flujo de escalación
```
Bot detecta caso no resuelto
       ↓
Chat SAC → POST /api/conversations → conversación creada ✅
       ↓
Agente consulta GET /escalation/session/:id
```

---

## FAQs del sistema

El bot incluye **45 preguntas frecuentes** cargadas dinámicamente desde la BD:

- **10 preguntas** para clientes
- **28 preguntas** para repartidores  
- **7 preguntas** para negocios/restaurantes

---

## Payload de escalación

Cuando el bot escala un caso, la respuesta incluye el campo `escalation_payload`:

```json
{
  "id_escalation": 1,
  "id_session": 7,
  "id_usuario": 1,
  "user_type": "cliente",
  "problem_category": "cargo_no_reconocido",
  "previous_state": "PROBLEMA_COBRO",
  "summary": "Resumen del caso para el agente...",
  "conversation_history": [...],
  "context_data": {
    "order_code": "PED-8",
    "total_messages": 5,
    "chat_sac_conversation_id": "uuid-conversacion"
  },
  "handoff_status": "pendiente"
}
```

---

## Pruebas

Con el servidor corriendo en `localhost:3004`:

```bash
npm test                  # Suite principal — flujos de cliente, repartidor y negocio
npm run test:escalation   # Suite de escalación — todos los flujos que escalan a agente
npm run test:all          # Ambas suites en secuencia
```

---

## Estructura del proyecto

```
chat-automatizado/
├── src/
│   ├── app.js                    punto de entrada
│   ├── config/
│   │   ├── database.js           conexión MySQL
│   │   ├── env.js                variables de entorno
│   │   ├── logger.js             configuración Pino
│   │   └── swagger.js            configuración Swagger UI
│   ├── controllers/              8 controllers (session, faq, escalation...)
│   ├── routes/                   8 archivos de rutas
│   ├── services/
│   │   ├── chat.Service.js       núcleo del bot — lógica principal
│   │   ├── escalation.service.js manejo de escalaciones al Chat SAC
│   │   └── external/
│   │       ├── auth.external.js        usuarios via Broker
│   │       ├── pedidos.external.js     pedidos via Logística
│   │       ├── descuentos.external.js  cupones reales
│   │       ├── cobros.external.js      reembolsos reales
│   │       ├── bancario.external.js    transferencias bancarias
│   │       └── httpHelper.js           cliente HTTP con logging Pino
│   ├── machines/
│   │   ├── chatMachine.js        máquina de estados XState
│   │   ├── guards.js             guardas de transición
│   │   └── states/
│   │       ├── clienteStates.js
│   │       ├── repartidorStates.js
│   │       └── negocioStates.js
│   ├── middlewares/
│   │   ├── errorHandler.js       manejo centralizado de errores
│   │   └── validateRequest.js    validación de requests
│   ├── models/                   8 modelos Sequelize
│   └── tests/
│       ├── chat.test.js          suite principal
│       └── escalation.test.js    suite de escalación
├── migrations/                   13 migraciones de BD
├── seeders/                      4 seeders (menús, FAQs, catálogos)
├── postman/                      colección Postman para pruebas
└── config/
    └── config.cjs                configuración Sequelize CLI
```

---

## Logging

El servicio usa **Pino** para logging estructurado. En desarrollo los logs se muestran formateados con `pino-pretty`. En producción se generan en formato JSON para Railway.

```
INFO  [Chat] Sesión iniciada — id_session: 1, user_type: cliente
INFO  [Logistica] Entrega encontrada — order_id: 8, entrega_id: 5
INFO  [Cobros] Reembolso procesado exitosamente — amount: 50
WARN  [Auth] Usando mock para usuario 1
```