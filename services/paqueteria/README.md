# Microservicio de Paquetería Instantánea

## Descripción General

Servicio backend para la gestión de envíos de paquetes instantáneos. Permite a clientes enviar paquetes de manera segura a través de repartidores registrados, con asignación directa de repartidores y seguimiento completo del estado de entrega.

### Responsabilidades Principales

- Gestión de cotizaciones de envío
- Asignación automática de repartidores
- Seguimiento del estado de envíos
- Gestión de disponibilidad de repartidores

---

## Flujo de Trabajo (Workflow)

### 1. Solicitud de Cotización
```
Cliente solicita cotización → Cálculo de precio basado en distancia/peso → Respuesta con desglose de costos
```
- **Endpoint**: `POST /api/packages/quote`
- **No crea registros** en la base de datos, solo devuelve una estimación.

### 2. Creación del Envío
```
Cliente crea envío → Envío en estado "pending" → Listo para asignación de repartidor
```
- **Endpoint**: `POST /api/shipments`
- El envío requiere `senderId` (remitente) y `receiverId` (receptor)
- Se crea directamente en estado "pending" para asignación inmediata

### 3. Asignación de Repartidor
```
Repartidor acepta envío → Estado cambia a "assigned" → Sistema registra evento de tracking
```
- **Endpoint**: `PATCH /api/shipments/:id/accept`
- El repartidor debe ser válido y existir en la base de datos

### 4. Entrega del Paquete
```
Repartidor en tránsito → Estado "in_transit" → Paquete entregado → Estado "delivered"
```
- **Endpoint**: `PATCH /api/shipments/:id/status`
- Las transiciones de estado están validadas
- Cada cambio genera un evento en el historial de seguimiento

### 5. Seguimiento en Tiempo Real
```
Cliente consulta historial de envío → Sistema retorna eventos ordenados cronológicamente
```
- **Endpoint**: `GET /api/packages/:id/tracking`
- Incluye ubicación si está disponible

### 6. Cancelación (Antes de Asignación)
```
Cliente solicita cancelación → Validación de permisos → Envío marcado como "cancelled"
```
- **Endpoint**: `POST /api/packages/:id/cancel`
- Solo disponible mientras el envío esté en estado "pending"

---

## Endpoints Disponibles

### 📦 Paquetes (Packages)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/packages/quote` | Generar cotización sin crear registro |
| GET | `/api/packages` | Listar todos los paquetes |
| GET | `/api/packages/:id` | Obtener detalles de un paquete |
| POST | `/api/packages` | Crear un nuevo paquete |
| PUT | `/api/packages/:id` | Actualizar un paquete |
| DELETE | `/api/packages/:id` | Eliminar paquete (lógico) |
| GET | `/api/packages/customers/me` | Obtener paquetes del cliente autenticado |
| POST | `/api/packages/:id/cancel` | Cancelar un paquete |
| GET | `/api/packages/:id/tracking` | Obtener historial de seguimiento |

### 📮 Envíos (Shipments)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/shipments` | Listar todos los envíos |
| GET | `/api/shipments/:id` | Obtener detalles de un envío |
| POST | `/api/shipments` | Crear un nuevo envío |
| DELETE | `/api/shipments/:id` | Eliminar envío (lógico) |
| PATCH | `/api/shipments/:id/accept` | Aceptar y asignar repartidor |
| PATCH | `/api/shipments/:id/status` | Actualizar estado del envío |

### 🚴 Repartidores (Couriers)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/couriers` | Listar todos los repartidores |
| GET | `/api/couriers/available` | Listar repartidores disponibles |
| GET | `/api/couriers/:id` | Obtener detalles de un repartidor |
| POST | `/api/couriers` | Crear un nuevo repartidor |
| PUT | `/api/couriers/:id` | Actualizar información del repartidor |
| PUT | `/api/couriers/:id/status` | Actualizar estado del repartidor |
| DELETE | `/api/couriers/:id` | Eliminar repartidor (lógico) |

### 👤 Usuarios (Users)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:id` | Obtener detalles de un usuario |
| POST | `/api/users` | Crear un nuevo usuario |
| PUT | `/api/users/:id` | Actualizar información del usuario |
| DELETE | `/api/users/:id` | Eliminar usuario (lógico) |

### 📍 Direcciones (Addresses)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/addresses` | Listar todas las direcciones |
| GET | `/api/addresses/:id` | Obtener detalles de una dirección |
| POST | `/api/addresses` | Crear una nueva dirección |
| PUT | `/api/addresses/:id` | Actualizar dirección |
| DELETE | `/api/addresses/:id` | Eliminar dirección (lógico) |

### 💰 Precios (Prices)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/prices` | Listar todas las tarifas |
| GET | `/api/prices/:id` | Obtener detalles de una tarifa |
| POST | `/api/prices` | Crear una nueva tarifa |
| PUT | `/api/prices/:id` | Actualizar tarifa |
| DELETE | `/api/prices/:id` | Eliminar tarifa (lógico) |

### 🏷️ Tipos de Estado de Repartidor (Courier Status Types)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/courier-status-types` | Listar tipos de estado |
| GET | `/api/courier-status-types/:id` | Obtener tipo de estado |
| POST | `/api/courier-status-types` | Crear tipo de estado |
| PUT | `/api/courier-status-types/:id` | Actualizar tipo de estado |
| DELETE | `/api/courier-status-types/:id` | Eliminar tipo de estado (lógico) |

### 📊 Estados de Repartidor (Courier Statuses)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/courier-statuses` | Listar estados de repartidores |
| GET | `/api/courier-statuses/:id` | Obtener estado de repartidor |
| POST | `/api/courier-statuses` | Crear estado de repartidor |
| PUT | `/api/courier-statuses/:id` | Actualizar estado |
| DELETE | `/api/courier-statuses/:id` | Eliminar estado (lógico) |

---

## Cómo Acceder a los Endpoints

### Configuración de Acceso

**URL Base**: `http://localhost:3001/api` (desarrollo local)

### Autenticación

El servicio **no maneja autenticación directa**. El broker es responsable de:
- Autenticar usuarios
- Generar y validar tokens JWT
- Pasar el token del cliente en las solicitudes

### Headers Requeridos

Para endpoints que requieren contexto de cliente:
```
x-customer-token: <token_del_cliente>
```

O como parámetro de query:
```
GET /api/packages/customers/me?customerToken=<token_del_cliente>
```

### Ejemplos de Solicitudes

#### 1. Obtener Cotización
```bash
curl -X POST http://localhost:3001/api/packages/quote \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "receiverId": 2,
    "packageDetails": {
      "weight": 2.5,
      "dimensions": "20x20x20"
    },
    "originAddress": {
      "latitude": 14.6345,
      "longitude": -91.5069
    },
    "destinationAddress": {
      "latitude": 14.6349,
      "longitude": -91.5073
    }
  }'
```

#### 2. Crear Envío
```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "receiverId": 2,
    "deliveryInstructions": "Entregar en recepción",
    "chargeType": "sender",
    "total": 150.00
  }'
```

#### 3. Aceptar Envío (Repartidor)
```bash
curl -X PATCH http://localhost:3001/api/shipments/1/accept \
  -H "Content-Type: application/json" \
  -d '{
    "courierId": 1
  }'
```

#### 6. Actualizar Estado del Envío
```bash
curl -X PATCH http://localhost:3001/api/shipments/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_transit"
  }'
```

#### 7. Obtener Paquetes del Cliente
```bash
curl -X GET "http://localhost:3001/api/packages/customers/me" \
  -H "x-customer-token: 1"
```

#### 8. Obtener Seguimiento
```bash
curl -X GET http://localhost:3001/api/packages/1/tracking
```

#### 9. Cancelar Paquete
```bash
curl -X POST http://localhost:3001/api/packages/1/cancel \
  -H "Content-Type: application/json" \
  -H "x-customer-token: 1"
```

---

## Estados del Envío

El servicio maneja los siguientes estados de envío:

| Estado | Descripción | Transiciones Válidas |
|--------|-------------|----------------------|
| `pending` | Esperando asignación de repartidor | → assigned |
| `assigned` | Repartidor asignado | → in_transit |
| `in_transit` | Paquete en camino | → delivered |
| `delivered` | Paquete entregado | (final) |
| `cancelled` | Cancelado | (final) |

---

## Reglas de Negocio

### Asignación de Repartidor
- Solo se puede asignar cuando el envío está en estado `pending`
- El repartidor debe existir en el sistema y ser válido

### Transiciones de Estado
- Las transiciones de estado están controladas y validadas
- No se permite cambiar arbitrariamente entre estados
- Cada transición registra un evento en el historial de seguimiento

### Cancelación
- Solo el remitente puede cancelar un envío
- Solo es permitido mientras el envío esté en estado `pending`

### Seguimiento
- Cada cambio de estado genera un evento de tracking automáticamente
- Los eventos se ordenan cronológicamente (más recientes primero)
- Incluye ubicación GPS si el repartidor la proporciona

---

## Estructura de Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema (remitentes y receptores)
- `couriers` - Repartidores registrados
- `shipments` - Envíos de paquetes
- `packages` - Detalles específicos de los paquetes
- `shipment_tracking` - Historial de cambios de estado
- `addresses` - Direcciones de entrega
- `prices` - Tarifas de envío
- `courier_statuses` - Estados actuales de repartidores
- `courier_status_types` - Tipos de estados disponibles

---

## 🚀 Instalación y Setup del Proyecto

### Requisitos Previos

- **Node.js** (v16 o superior)
- **npm** o **yarn**
- **PostgreSQL** (v12 o superior)
- **Docker** (opcional, para desarrollo con contenedores)

### Tutorial de Configuración Inicial

#### Paso 1: Clonar o descargar el proyecto

```bash
cd /ruta/al/proyecto
```

#### Paso 2: Instalar dependencias

```bash
npm install
```

#### Paso 3: Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env  # Si existe
# O crear manualmente
```

Editar `.env` con los siguientes valores:

```env
# Entorno
NODE_ENV=development

# Servidor
PORT=3001

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paqueteria
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_DIALECT=postgres

# Logs
LOG_LEVEL=info
```

#### Paso 4: Crear la base de datos PostgreSQL

```bash
# Conectarse a PostgreSQL como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE paqueteria;

# Salir
\q
```

#### Paso 5: Ejecutar las seeds para poblar datos iniciales

Las seeds preparan la base de datos con datos de prueba necesarios para el desarrollo.

**Opción 1: Ejecutar ambos seeds (Recomendado)**
```bash
npm run seed:all
```

**Opción 2: Ejecutar seeds por separado**
```bash
# Seed principal (limpia y crea estructura base)
npm run seed

# Seed de paquetería (agrega envíos y paquetes de prueba)
npm run seed:package
```

**¿Qué hace cada seed?**

- `npm run seed`: Limpia todas las tablas y crea:
  - 4 usuarios de prueba
  - 2 repartidores
  - 3 tarifas base
  - Tipos de estado de repartidor

- `npm run seed:package`: Crea:
  - 3 envíos en diferentes estados (pending, assigned, etc.)
  - Paquetes asociados
  - Eventos de tracking de ejemplo

#### Paso 6: Iniciar el servidor

**Modo Desarrollo (con hot reload):**
```bash
npm run dev
```

**Modo Producción:**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

---

### Tutorial Completo: Desde Cero hasta Pruebas

```bash
# 1. Navegar al proyecto
cd /ruta/al/proyecto/services/paqueteria

# 2. Instalar dependencias
npm install

# 3. Configurar .env (ver paso 3 arriba)
nano .env

# 4. Crear base de datos PostgreSQL
psql -U postgres -c "CREATE DATABASE paqueteria;"

# 5. Ejecutar seeds
npm run seed:all

# 6. Iniciar servidor en otra terminal
npm run dev

# 7. Verificar que funciona (en otra terminal)
curl http://localhost:3001/

# Respuesta esperada:
# "Servicio de Paquetería funcionando"
```

---

## Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |
| `PORT` | Puerto del servidor | `3001` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la BD | `paqueteria` |
| `DB_USER` | Usuario de BD | `postgres` |
| `DB_PASSWORD` | Contraseña de BD | `tu_contraseña` |
| `DB_DIALECT` | Tipo de BD | `postgres` |

### Docker

Para ejecutar el servicio en contenedor con la BD integrada:

```bash
# Levantar contenedores (PostgreSQL + Node.js)
docker-compose up -d

# Ver logs del servicio
docker-compose logs -f paqueteria

# Detener contenedores
docker-compose down

# Ejecutar seeds dentro del contenedor
docker-compose exec paqueteria npm run seed:all
```

**Archivo `docker-compose.yml` requerido:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: paqueteria
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  paqueteria:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: paqueteria
      DB_USER: postgres
      DB_PASSWORD: password

volumes:
  postgres_data:
```

---

## Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Inicia servidor con hot reload (nodemon) |
| Producción | `npm start` | Inicia servidor sin recargas |
| Seed base | `npm run seed` | Ejecuta seed principal |
| Seed paquetería | `npm run seed:package` | Ejecuta seed de paquetes |
| Todos los seeds | `npm run seed:all` | Ejecuta ambos seeds en secuencia |

---

## Dependencias

- **Express.js**: Framework web minimalista
- **Sequelize**: ORM para NodeJS (base de datos)
- **PostgreSQL**: Sistema de base de datos relacional
- **CORS**: Middleware para solicitudes cross-origin
- **dotenv**: Gestión de variables de entorno
- **pg**: Driver de PostgreSQL para Node.js
- **pg-hstore**: Soporte para tipos JSON en PostgreSQL

### Dev Dependencies

- **nodemon**: Monitor de cambios para desarrollo

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- **Causa**: PostgreSQL no está corriendo
- **Solución**: Iniciar PostgreSQL o usar Docker

### Error: "database \"paqueteria\" does not exist"
- **Causa**: La BD no ha sido creada
- **Solución**: Ejecutar `psql -U postgres -c "CREATE DATABASE paqueteria;"`

### Error: "Cannot find module"
- **Causa**: Dependencias no instaladas
- **Solución**: Ejecutar `npm install`

### Seeds no ejecutan
- **Causa**: Variables de entorno no configuradas correctamente
- **Solución**: Verificar `.env` y que PostgreSQL esté disponible

---

## Notas Importantes

1. **Eliminación Lógica**: Todos los DELETE son eliminaciones lógicas (se marca el estado como inactivo)
2. **Token del Cliente**: El broker proporciona el `x-customer-token` en las solicitudes
3. **Validación de Transiciones**: El sistema no permite transiciones de estado inválidas
4. **Tracking Automático**: Cada acción genera un evento en el historial automáticamente
5. **Seeds en Desarrollo**: Usa `npm run seed:all` siempre que necesites resetear datos de prueba

---

## Soporte

Para reportar issues o sugerencias, contactar al equipo de desarrollo.

**Última actualización**: Mayo 2026
