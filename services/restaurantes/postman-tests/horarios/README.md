# CRUD de Horarios de Restaurantes

Este módulo maneja la gestión completa de horarios para los restaurantes.

## Estructura de la tabla `horarios_restaurante`

```sql
CREATE TABLE horarios_restaurante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    dia_semana TINYINT NOT NULL,
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);
```

## Días de la semana

- `0` = Lunes
- `1` = Martes
- `2` = Miércoles
- `3` = Jueves
- `4` = Viernes
- `5` = Sábado
- `6` = Domingo

## Endpoints disponibles

### 1. Crear Horario
**POST** `/api/horarios`

Crea un nuevo horario para un restaurante específico.

**Body:**
```json
{
  "restaurante_id": 1,
  "dia_semana": 1,
  "hora_apertura": "08:00:00",
  "hora_cierre": "22:00:00"
}
```

**Validaciones:**
- `restaurante_id`: Debe existir en la tabla restaurantes
- `dia_semana`: Valor entre 0 y 6
- `hora_apertura` y `hora_cierre`: Formato HH:MM:SS o HH:MM

---

### 2. Listar Horarios
**GET** `/api/horarios`

Obtiene todos los horarios con filtros opcionales.

**Query Params (opcionales):**
- `restaurante_id`: Filtrar por restaurante
- `dia_semana`: Filtrar por día (0-6)
- `activo`: Filtrar por estado (true/false)

**Ejemplos:**
```
GET /api/horarios
GET /api/horarios?restaurante_id=1
GET /api/horarios?dia_semana=0
GET /api/horarios?activo=true
GET /api/horarios?restaurante_id=1&activo=true
```

---

### 3. Obtener Horario por ID
**GET** `/api/horarios/:id`

Obtiene un horario específico por su ID.

**Ejemplo:**
```
GET /api/horarios/1
```

---

### 4. Obtener Horarios por Restaurante
**GET** `/api/horarios/restaurante/:restaurante_id`

Obtiene todos los horarios de un restaurante ordenados por día.

**Query Params (opcionales):**
- `activo`: Filtrar por estado (true/false)

**Ejemplos:**
```
GET /api/horarios/restaurante/1
GET /api/horarios/restaurante/1?activo=true
```

---

### 5. Actualizar Horario
**PUT** `/api/horarios/:id`

Actualiza un horario existente.

**Body (todos los campos son opcionales):**
```json
{
  "dia_semana": 1,
  "hora_apertura": "07:00:00",
  "hora_cierre": "23:00:00",
  "activo": true
}
```

**Nota:** Solo se actualizan los campos proporcionados.

---

### 6. Eliminar Horario
**DELETE** `/api/horarios/:id`

Inactiva un horario (soft delete).

**Ejemplo:**
```
DELETE /api/horarios/1
```

**Nota:** Esta operación no elimina el registro, solo marca `activo = false`.

---

### 7. Activar/Desactivar Horario
**PATCH** `/api/horarios/:id/activo`

Alterna o establece el estado activo de un horario.

**Body (opcional):**
```json
{
  "activo": true
}
```

**Nota:** Si no se proporciona el campo `activo`, se alterna el estado actual.

---

## Archivos del CRUD

### Controlador
- `src/controllers/restaurantes/horario.controller.js`

### Rutas
- `src/routes/restaurantes/horario.routes.js`

### Modelo
- `src/models/restaurantes/horario-restaurante.model.js`

### Pruebas Postman
- `postman-tests/horarios/01-crear-horario.json`
- `postman-tests/horarios/02-crear-horario-semana.json`
- `postman-tests/horarios/03-listar-horarios.json`
- `postman-tests/horarios/04-obtener-horario.json`
- `postman-tests/horarios/05-obtener-horarios-por-restaurante.json`
- `postman-tests/horarios/06-actualizar-horario.json`
- `postman-tests/horarios/07-eliminar-horario.json`
- `postman-tests/horarios/08-toggle-activo.json`

---

## Ejemplo de uso: Configurar horarios de toda la semana

Para configurar los horarios de lunes a viernes (9:00 - 21:00) y fin de semana (10:00 - 23:00):

```bash
# Lunes a Viernes
for dia in {0..4}; do
  curl -X POST http://localhost:3000/api/horarios \
    -H "Content-Type: application/json" \
    -d "{\"restaurante_id\": 1, \"dia_semana\": $dia, \"hora_apertura\": \"09:00\", \"hora_cierre\": \"21:00\"}"
done

# Sábado y Domingo
for dia in {5..6}; do
  curl -X POST http://localhost:3000/api/horarios \
    -H "Content-Type: application/json" \
    -d "{\"restaurante_id\": 1, \"dia_semana\": $dia, \"hora_apertura\": \"10:00\", \"hora_cierre\": \"23:00\"}"
done
```

---

## Relaciones

El modelo `HorarioRestaurante` tiene las siguientes relaciones:

- **belongsTo** `Restaurante` (N:1)
  - Un horario pertenece a un restaurante
  - Se puede incluir con `as: 'restaurante'`

---

## Respuestas de la API

### Éxito
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos del horario */ },
  "count": 10  // solo en listados
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Horario creado
- `400 Bad Request`: Datos inválidos
- `404 Not Found`: Horario o restaurante no encontrado
- `500 Internal Server Error`: Error del servidor
