# 🚀 Inicio Rápido - PostgreSQL con Docker

## 📋 Pasos Rápidos

```bash
# 1. Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# 2. Crear usuario y base de datos (solo primera vez)
# Opción A - Script automático:
bash setup-postgres.sh

# Opción B - Manual:
docker exec -it postgres16 psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;"
docker exec -it postgres16 psql -U postgres -c "CREATE DATABASE modulo_logistica_db OWNER admin;"

# 3. Instalar dependencias
npm install

# 4. Sincronizar tablas
node syncDatabase.js

# 5. Probar modelos
node test-models.js

# 6. Iniciar servidor
npm start
```

## 🔧 Scripts Disponibles

- `bash setup-postgres.sh` → Configura usuario y DB en Docker (auto)
- `node syncDatabase.js` → Crea/actualiza tablas + datos iniciales
- `node test-models.js` → Verifica modelos y conexión
- `npm start` → Inicia el servidor

## 📝 Instalar psql (opcional)

```bash
# Ubuntu/Debian
sudo apt install postgresql-client

# Fedora/RHEL
sudo dnf install postgresql
```

## 🐳 Nombre de tu contenedor

En tu caso el contenedor se llama: **postgres16**

✨ **Listo!**
