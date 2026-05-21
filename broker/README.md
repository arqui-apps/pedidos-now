# Broker Service

Servicio intermediario tipo API Gateway. Su responsabilidad es recibir peticiones en un unico endpoint, validar que la ruta este registrada y reenviarla al microservicio de negocios configurado en `BUSINESS_URL`.

## Como correr el proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar el archivo `.env`
Define los puertos y la URL del microservicio de negocios:

```env
BROKER_PORT=4000
BUSINESS_URL=http://localhost:3000
```

### 3. Levantar el broker
```bash
npm start
```

En desarrollo:

```bash
npm run dev
```

El broker corre en `http://localhost:4000`.

## Como usarlo en Postman

Solo existe un endpoint publico del broker:

```http
POST http://localhost:4000/api/broker/request
```

### Body base

```json
{
  "method": "GET",
  "path": "/businesses"
}
```

El broker internamente reenvia esa peticion a:

```http
GET {BUSINESS_URL}/api/businesses
```

## Formato soportado

```json
{
  "method": "POST",
  "path": "/businesses",
  "query": {
    "businessStatus": "active"
  },
  "headers": {
    "Authorization": "Bearer token"
  },
  "body": {
    "tradeName": "Farmacia Central Demo",
    "businessType": "pharmacy"
  }
}
```

Tambien puedes enviar filtros directamente en `path`, por ejemplo:

```json
{
  "method": "GET",
  "path": "/businesses?businessStatus=active&businessType=pharmacy"
}
```

## Ejemplos

### Crear negocio
```json
{
  "method": "POST",
  "path": "/businesses",
  "body": {
    "tradeName": "Farmacia Central Demo",
    "legalName": "Farmacia Central Sociedad Anonima",
    "businessType": "pharmacy",
    "businessStatus": "active"
  }
}
```

### Retirar negocio
```json
{
  "method": "PATCH",
  "path": "/businesses/1/retire",
  "body": {
    "retirementReason": "Retiro solicitado para prueba"
  }
}
```

### Actualizar disponibilidad
```json
{
  "method": "PATCH",
  "path": "/businesses/1/availability",
  "body": {
    "businessStatus": "temporarily_closed",
    "reason": "Cierre temporal de prueba"
  }
}
```

### Restaurar producto
```json
{
  "method": "PATCH",
  "path": "/businesses/1/products/2/restore",
  "body": {
    "productStatus": "active"
  }
}
```

### Consultar catalogo interno
```json
{
  "method": "GET",
  "path": "/internal/businesses/1/base-catalog"
}
```

## Rutas registradas

Las rutas que el broker reconoce estan en:

```text
src/config/routeMap.js
```

El broker no implementa la logica de negocio. Si una ruta existe en el mapa pero el microservicio `BUSINESS_URL` no esta levantado, la respuesta esperada es `503 business-service no disponible`.

## Estructura del proyecto

```text
broker/
├── src/
│   ├── index.js
│   ├── routes/
│   │   └── brokerRoutes.js
│   ├── controllers/
│   │   └── brokerController.js
│   ├── services/
│   │   └── serviceResolver.js
│   └── config/
│       └── routeMap.js
├── package.json
└── README.md
```
