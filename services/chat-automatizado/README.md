# Microservicio de Soporte - API FAQ

Microservicio backend desarrollado con Node.js, Express y MySQL para la gestión de soporte.  
Actualmente, este servicio ya cuenta con la funcionalidad de FAQ operativa mediante API REST.

```
project-root/
├─ src/
│  ├─ config/
│  │  └─ database.js
│  ├─ controllers/
│  │  └─ faq.controller.js
│  ├─ routes/
│  │  └─ faq.routes.js
│  ├─ middlewares/
│  ├─ services/
│  ├─ app.js
│  └─ index.js
├─ migrations/
│  └─ 20260328071709-alter-faq-update-date.cjs
├─ seeders/
├─ postman/
│  └─ support-faq.postman_collection.json
├─ .env
├─ .sequelizerc
├─ package.json
└─ README.md
```


## Estado actual

La parte de FAQ ya se encuentra funcional con:

- Crear FAQ
- Listar FAQs
- Obtener FAQ por id
- Actualizar FAQ
- Desactivar FAQ con soft delete
- Filtros por categoría
- Filtros por estado
- Búsqueda por texto
- Paginación

Nota:
- El borrado es lógico, no físico.
- La eliminación cambia el estado de la FAQ a `inactive`.
- La API actualmente está enfocada en funcionalidad base y pruebas internas.

---
---

## Requisitos previos

Antes de levantar el proyecto, asegúrate de tener instalado todo con: 
```bash
npm install 
```
configura tu archivo .env basandote en el .env.example
Luego aplica migraciones y seeders si es necesario con 
```bash 
npx sequelize-cli db:migrate --config config/config.cjs
npx sequelize-cli db:seed:all --config src/config/config.cjs 
```

## Pruebas con Postman
Importa la colección `postman/support-faq.postman_collection.json` en Postman para probar todos los endpoints.