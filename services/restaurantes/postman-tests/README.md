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

## 📁 Archivos de prueba

Cada archivo JSON contiene ejemplos de peticiones para probar diferentes escenarios.
