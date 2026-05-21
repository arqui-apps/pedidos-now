# Colección Postman - Soporte Chats

Esta carpeta contiene la colección final de Postman para probar el microservicio de Soporte/Chats desplegado en Railway.

## Archivo principal

- `soporte-chats-final-railway.postman_collection.json`

## Incluye pruebas para

- Health
- DB test
- Availability
- Conversaciones
- Mensajes
- Asignación de agente
- Cambio de estado
- Chatbot → Soporte
- External context
- Restaurantes
- Paquetería
- Negocios
- Descuentos
- Cobros
- Admin/Contabilidad
- Prefijo `/api/soporte`

## Pendiente

- Broker/Auth

Actualmente la colección usa URLs directas de Railway y no variables de colección. En los endpoints que requieren IDs se dejaron placeholders como:

- `PEGAR_CONVERSATION_ID`
- `PEGAR_PAYMENT_ID`
- `PEGAR_SESSION_ID`

Estos valores deben reemplazarse manualmente durante las pruebas.