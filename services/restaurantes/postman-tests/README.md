# Pruebas de Postman - Restaurantes Service

Esta carpeta contiene los ejemplos de JSON para probar los endpoints del servicio de restaurantes.

## 🚀 Cómo usar

1. Asegúrate de que el servidor esté corriendo: `npm run dev`
2. El servidor estará disponible en: `http://localhost:3000`
3. Base URL de la API: `http://localhost:3000/api`

## 📋 Endpoints disponibles

### Health Check
- `GET http://localhost:3000/health` - Verificar que el servidor está funcionando

### Restaurantes
- `GET http://localhost:3000/api/restaurantes` - Obtener todos los restaurantes
- `GET http://localhost:3000/api/restaurantes/:id` - Obtener un restaurante específico
- `POST http://localhost:3000/api/restaurantes` - Crear un restaurante
- `PUT http://localhost:3000/api/restaurantes/:id` - Actualizar un restaurante
- `DELETE http://localhost:3000/api/restaurantes/:id` - Inactivar un restaurante
- `PATCH http://localhost:3000/api/restaurantes/:id/disponibilidad` - Cambiar disponibilidad

### Productos
- `GET http://localhost:3000/api/productos` - Obtener todos los productos
- `GET http://localhost:3000/api/productos/:id` - Obtener un producto específico
- `GET http://localhost:3000/api/productos/restaurante/:restaurante_id` - Obtener productos por restaurante
- `POST http://localhost:3000/api/productos` - Crear un producto
- `PUT http://localhost:3000/api/productos/:id` - Actualizar un producto
- `DELETE http://localhost:3000/api/productos/:id` - Inactivar un producto
- `PATCH http://localhost:3000/api/productos/:id/activo` - Activar/desactivar producto

## 📁 Archivos de prueba

Cada archivo JSON contiene ejemplos de peticiones para probar diferentes escenarios.

### Estructura
- `/restaurantes/` - Pruebas para el módulo de restaurantes
- `/productos/` - Pruebas para el módulo de productos
