#!/bin/bash

# Script para configurar PostgreSQL en Docker
# Ejecutar: bash setup-postgres.sh

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🐳 CONFIGURACIÓN DE POSTGRESQL EN DOCKER"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verificar que el contenedor existe
if ! docker ps -a | grep -q postgres16; then
    echo "❌ El contenedor 'postgres16' no existe"
    echo ""
    echo "💡 Créalo con:"
    echo "   docker run -d --name postgres16 -p 5432:5432 \\"
    echo "     -e POSTGRES_PASSWORD=postgres \\"
    echo "     postgres:16"
    echo ""
    exit 1
fi

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q postgres16; then
    echo "⚠️  El contenedor 'postgres16' no está corriendo"
    echo "🔄 Iniciándolo..."
    docker start postgres16
    sleep 3
fi

echo "✅ Contenedor 'postgres16' está corriendo"
echo ""

# Crear usuario admin
echo "1️⃣  Creando usuario 'admin'..."
docker exec -it postgres16 psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Usuario 'admin' creado"
else
    echo "   ℹ️  Usuario 'admin' ya existe (ok)"
fi
echo ""

# Crear base de datos
echo "2️⃣  Creando base de datos 'modulo_logistica_db'..."
docker exec -it postgres16 psql -U postgres -c "CREATE DATABASE modulo_logistica_db OWNER admin;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Base de datos creada"
else
    echo "   ℹ️  Base de datos ya existe (ok)"
fi
echo ""

# Verificar conexión
echo "3️⃣  Verificando conexión..."
RESULT=$(docker exec -it postgres16 psql -U admin -d modulo_logistica_db -c "SELECT 1;" 2>&1)

if echo "$RESULT" | grep -q "1 row"; then
    echo "   ✅ Conexión exitosa"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "            ✅ CONFIGURACIÓN COMPLETADA"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📝 Configuración en .env:"
    echo "   DB_NAME=modulo_logistica_db"
    echo "   DB_USER=admin"
    echo "   DB_PASSWORD=admin123"
    echo "   DB_HOST=localhost"
    echo "   DB_PORT=5432"
    echo ""
    echo "🚀 Siguiente paso:"
    echo "   node syncDatabase.js"
    echo ""
else
    echo "   ❌ Error en la conexión"
    echo ""
    echo "Detalles del error:"
    echo "$RESULT"
fi
