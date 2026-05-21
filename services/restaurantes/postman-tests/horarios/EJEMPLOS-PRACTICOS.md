# Ejemplos Prácticos - CRUD Horarios

## Escenario 1: Configurar horario de lunes a viernes (9:00 - 21:00)

### Usando curl:
```bash
# Lunes (dia_semana = 0)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 0, "hora_apertura": "09:00", "hora_cierre": "21:00"}'

# Martes (dia_semana = 1)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 1, "hora_apertura": "09:00", "hora_cierre": "21:00"}'

# Miércoles (dia_semana = 2)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 2, "hora_apertura": "09:00", "hora_cierre": "21:00"}'

# Jueves (dia_semana = 3)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 3, "hora_apertura": "09:00", "hora_cierre": "21:00"}'

# Viernes (dia_semana = 4)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 4, "hora_apertura": "09:00", "hora_cierre": "21:00"}'
```

## Escenario 2: Horario especial de fin de semana (10:00 - 23:00)

```bash
# Sábado (dia_semana = 5)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 5, "hora_apertura": "10:00", "hora_cierre": "23:00"}'

# Domingo (dia_semana = 6)
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"restaurante_id": 1, "dia_semana": 6, "hora_apertura": "10:00", "hora_cierre": "23:00"}'
```

## Escenario 3: Consultar horarios de un restaurante

```bash
# Ver todos los horarios del restaurante 1
curl http://localhost:3000/api/horarios/restaurante/1

# Ver solo horarios activos del restaurante 1
curl http://localhost:3000/api/horarios/restaurante/1?activo=true
```

## Escenario 4: Modificar horario de un día específico

```bash
# Cambiar horario del lunes (supongamos que tiene id = 1)
curl -X PUT http://localhost:3000/api/horarios/1 \
  -H "Content-Type: application/json" \
  -d '{"hora_apertura": "08:00", "hora_cierre": "22:00"}'
```

## Escenario 5: Desactivar horario temporalmente

```bash
# Desactivar horario del domingo (id = 7)
curl -X DELETE http://localhost:3000/api/horarios/7

# O usando toggle
curl -X PATCH http://localhost:3000/api/horarios/7/activo \
  -H "Content-Type: application/json" \
  -d '{"activo": false}'
```

## Escenario 6: Reactivar horario

```bash
# Reactivar horario del domingo (id = 7)
curl -X PATCH http://localhost:3000/api/horarios/7/activo \
  -H "Content-Type: application/json" \
  -d '{"activo": true}'
```

## Escenario 7: Buscar horarios de todos los lunes

```bash
# Ver todos los horarios de lunes (dia_semana = 0)
curl http://localhost:3000/api/horarios?dia_semana=0
```

## Escenario 8: Ver un horario específico

```bash
# Ver detalles del horario con id = 1
curl http://localhost:3000/api/horarios/1
```

## Usando Postman

### Importar colección:
1. Abre Postman
2. Click en "Import"
3. Selecciona los archivos JSON de `postman-tests/horarios/`
4. Los endpoints estarán listos para usar

### Variables de entorno sugeridas:
```json
{
  "base_url": "http://localhost:3000/api",
  "restaurante_id": "1"
}
```

Luego puedes usar: `{{base_url}}/horarios`

## Script PowerShell para configurar semana completa

```powershell
# Configurar horarios de lunes a viernes
0..4 | ForEach-Object {
    $body = @{
        restaurante_id = 1
        dia_semana = $_
        hora_apertura = "09:00"
        hora_cierre = "21:00"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:3000/api/horarios" `
                      -Method POST `
                      -Body $body `
                      -ContentType "application/json"
}

# Configurar horarios de fin de semana
5..6 | ForEach-Object {
    $body = @{
        restaurante_id = 1
        dia_semana = $_
        hora_apertura = "10:00"
        hora_cierre = "23:00"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:3000/api/horarios" `
                      -Method POST `
                      -Body $body `
                      -ContentType "application/json"
}
```

## Respuestas Esperadas

### Éxito al crear:
```json
{
  "success": true,
  "message": "Horario creado exitosamente",
  "data": {
    "id": 1,
    "restaurante_id": 1,
    "dia_semana": 1,
    "hora_apertura": "08:00:00",
    "hora_cierre": "22:00:00",
    "activo": true
  }
}
```

### Lista de horarios:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "restaurante_id": 1,
      "dia_semana": 0,
      "hora_apertura": "09:00:00",
      "hora_cierre": "21:00:00",
      "activo": true,
      "restaurante": {
        "id": 1,
        "nombre": "Restaurante El Buen Sabor"
      }
    }
  ],
  "count": 1
}
```

### Error - Restaurante no existe:
```json
{
  "success": false,
  "message": "Restaurante no encontrado"
}
```

### Error - Día inválido:
```json
{
  "success": false,
  "message": "Día de semana inválido. Debe estar entre 0 (Lunes) y 6 (Domingo)"
}
```

### Error - Formato de hora inválido:
```json
{
  "success": false,
  "message": "Formato de hora inválido. Use HH:MM:SS o HH:MM"
}
```
