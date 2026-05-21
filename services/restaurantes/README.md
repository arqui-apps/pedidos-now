# Restaurantes Service

Microservicio de gestión de restaurantes, productos, combos y pedidos.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, env, servicios externos)
├── models/          # Modelos Sequelize
├── controllers/     # Lógica de negocio
├── routes/          # Definición de endpoints
├── services/        # Consumo de APIs externas
├── middlewares/     # Middlewares (auth, validación, errores)
├── helpers/         # Funciones auxiliares
└── app.js           # Configuración de Express

context/             # Documentación para IA y equipo
migrations/          # Migraciones de Sequelize
seeders/             # Datos de prueba
tests/               # Tests
```

## 📚 Documentación

Ver carpeta `context/` para documentación completa:
- `PROJECT_CONTEXT.md` - Descripción general
- `ENDPOINTS.md` - Documentación de endpoints
- `DB_SCHEMA.md` - Esquema de base de datos
- `EXTERNAL_APIS.md` - Contratos con otros servicios
- `PROGRESS.md` - Estado del proyecto

## 🔧 Tecnologías

- Node.js + Express
- Sequelize + MySQL
- JWT + express-validator
- Axios para APIs externas

## 🌐 Endpoints Principales

- `/api/restaurantes` - Gestión de restaurantes
- `/api/productos` - Gestión de productos
- `/api/combos` - Gestión de combos
- `/api/pedidos` - Gestión de pedidos
- `/api/descuentos` - Gestión de descuentos
- `/health` - Health check

## 👥 Equipo

Proyecto colaborativo de 4 integrantes
