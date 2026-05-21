#!/usr/bin/env node

/**
 * Script de inicialización completa de la base de datos PostgreSQL
 * Ejecutar: node init-database.js
 * 
 * Este script:
 * 1. Crea la base de datos si no existe
 * 2. Ejecuta el script SQL completo (logistica-v3.sql)
 * 3. Verifica que todo esté correcto
 */

require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs');

const DB_NAME = process.env.DB_NAME || 'modulo_logistica_db';
const DB_USER = process.env.DB_USER || 'admin';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin123';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const SQL_FILE = path.join(__dirname, 'db', 'logistica-v3.sql');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║   INICIALIZACIÓN DE BASE DE DATOS POSTGRESQL             ║');
console.log('║            Módulo de Logística v3.0                      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function initDatabase() {
    try {
        // Paso 1: Crear la base de datos usando el módulo de conexión
        console.log('🔧 Paso 1: Creando base de datos si no existe...\n');
        
        const { createDatabaseIfNotExists } = require('./db/db');
        const dbCreated = await createDatabaseIfNotExists();
        
        if (!dbCreated) {
            throw new Error('No se pudo crear/verificar la base de datos');
        }
        
        console.log('');
        
        // Paso 2: Verificar que el archivo SQL existe
        console.log('📄 Paso 2: Verificando archivo SQL...\n');
        
        if (!fs.existsSync(SQL_FILE)) {
            throw new Error(`Archivo SQL no encontrado: ${SQL_FILE}`);
        }
        
        console.log(`   ✅ Archivo encontrado: ${SQL_FILE}\n`);
        
        // Paso 3: Ejecutar el script SQL
        console.log('🔄 Paso 3: Ejecutando script SQL...\n');
        console.log('   ⚠️  Esto puede tardar unos segundos...\n');
        
        // Configurar variable de entorno para la contraseña
        const env = {
            ...process.env,
            PGPASSWORD: DB_PASSWORD
        };
        
        const command = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "${SQL_FILE}" -q`;
        
        try {
            const { stdout, stderr } = await execAsync(command, { env });
            
            if (stderr && !stderr.includes('NOTICE')) {
                console.log('   ⚠️  Advertencias:', stderr);
            }
            
            console.log('   ✅ Script SQL ejecutado exitosamente\n');
        } catch (error) {
            // Si falla, intentar con método alternativo
            console.log('   ℹ️  Intentando método alternativo...\n');
            
            const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
            const { sequelize } = require('./db/db');
            
            await sequelize.query(sqlContent);
            console.log('   ✅ Script SQL ejecutado exitosamente\n');
        }
        
        // Paso 4: Verificar tablas creadas
        console.log('🔍 Paso 4: Verificando tablas creadas...\n');
        
        const { sequelize } = require('./db/db');
        
        const [tables] = await sequelize.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `);
        
        console.log(`   ✅ Total de tablas creadas: ${tables.length}\n`);
        
        tables.forEach(table => {
            console.log(`      • ${table.tablename}`);
        });
        
        console.log('');
        
        // Paso 5: Verificar datos iniciales
        console.log('📊 Paso 5: Verificando datos iniciales...\n');
        
        const [categorias] = await sequelize.query(
            'SELECT codigo, nombre FROM categorias_orden ORDER BY orden_display'
        );
        
        if (categorias.length > 0) {
            console.log(`   ✅ Categorías iniciales (${categorias.length}):\n`);
            categorias.forEach(cat => {
                console.log(`      • ${cat.codigo.padEnd(10)} → ${cat.nombre}`);
            });
        } else {
            console.log('   ⚠️  No se encontraron categorías iniciales');
        }
        
        console.log('');
        
        // Cerrar conexión
        await sequelize.close();
        
        // Resumen final
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║              ✅ INICIALIZACIÓN COMPLETADA                 ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║  Base de datos: ${DB_NAME.padEnd(42)} ║`);
        console.log(`║  Tablas creadas: ${String(tables.length).padEnd(40)} ║`);
        console.log(`║  Categorías: ${String(categorias.length).padEnd(44)} ║`);
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log('🚀 Siguiente paso: node test-models.js\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR EN LA INICIALIZACIÓN:\n');
        console.error(`   ${error.message}\n`);
        
        if (error.message.includes('authentication failed')) {
            console.log('💡 Sugerencia: Verifica las credenciales en el archivo .env\n');
            console.log('   DB_USER=admin');
            console.log('   DB_PASSWORD=admin123\n');
        } else if (error.message.includes('connection refused')) {
            console.log('💡 Sugerencia: Asegúrate de que PostgreSQL esté corriendo:\n');
            console.log('   sudo systemctl start postgresql\n');
        } else if (error.message.includes('role') && error.message.includes('does not exist')) {
            console.log('💡 Sugerencia: Crea el usuario admin en PostgreSQL:\n');
            console.log('   sudo -u postgres createuser -s admin');
            console.log('   sudo -u postgres psql -c "ALTER USER admin WITH PASSWORD \'admin123\';"');
            console.log('');
        }
        
        console.error('Detalles completos del error:');
        console.error(error);
        console.log('');
        
        process.exit(1);
    }
}

// Ejecutar
initDatabase();
