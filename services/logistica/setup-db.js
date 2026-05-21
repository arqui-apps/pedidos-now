#!/usr/bin/env node

/**
 * Script simple de inicialización de base de datos
 * Solo usa Node.js y Sequelize, sin necesidad de psql
 * Ejecutar: node setup-db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const DB_NAME = process.env.DB_NAME || 'modulo_logistica_db';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║        SETUP DE BASE DE DATOS - LOGÍSTICA v3.0           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function setupDatabase() {
    try {
        // Paso 1: Crear la base de datos
        console.log('🔧 Paso 1: Creando base de datos...\n');
        
        const { createDatabaseIfNotExists } = require('./db/db');
        const dbCreated = await createDatabaseIfNotExists();
        
        if (!dbCreated) {
            throw new Error('No se pudo crear la base de datos');
        }
        
        console.log('');
        
        // Paso 2: Conectar a la base de datos creada
        console.log('🔌 Paso 2: Conectando a la base de datos...\n');
        
        const { sequelize } = require('./db/db');
        await sequelize.authenticate();
        
        console.log('   ✅ Conexión establecida\n');
        
        // Paso 3: Leer y ejecutar el script SQL
        console.log('📄 Paso 3: Ejecutando script SQL...\n');
        
        const sqlFile = path.join(__dirname, 'db', 'logistica-v3.sql');
        
        if (!fs.existsSync(sqlFile)) {
            throw new Error(`Archivo SQL no encontrado: ${sqlFile}`);
        }
        
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Dividir el SQL en comandos individuales y ejecutarlos
        console.log('   ⚠️  Ejecutando comandos SQL (puede tardar)...\n');
        
        try {
            // Ejecutar todo el SQL de una vez
            await sequelize.query(sqlContent);
            console.log('   ✅ Script SQL ejecutado exitosamente\n');
        } catch (sqlError) {
            // Si falla, intentar ejecutar línea por línea
            console.log('   ℹ️  Ejecutando comandos uno por uno...\n');
            
            const commands = sqlContent
                .split(';')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
            
            let executed = 0;
            let errors = 0;
            
            for (const command of commands) {
                try {
                    await sequelize.query(command);
                    executed++;
                } catch (err) {
                    // Ignorar errores de objetos que ya existen
                    if (!err.message.includes('already exists')) {
                        errors++;
                        console.log(`   ⚠️  Error en comando: ${err.message.substring(0, 50)}...`);
                    }
                }
            }
            
            console.log(`\n   ✅ Comandos ejecutados: ${executed}, Errores: ${errors}\n`);
        }
        
        // Paso 4: Verificar tablas
        console.log('🔍 Paso 4: Verificando estructura...\n');
        
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        console.log(`   📊 Tablas creadas (${tables.length}):\n`);
        
        const expectedTables = [
            'categorias_orden',
            'repartidores',
            'entregas',
            'asignaciones_entrega',
            'historial_estados_entrega',
            'incidencias_entrega',
            'historial_ubicaciones_repartidor',
            'notificaciones_logistica',
            'calificaciones_entrega'
        ];
        
        expectedTables.forEach(tableName => {
            const exists = tables.some(t => t.table_name === tableName);
            console.log(`      ${exists ? '✅' : '❌'} ${tableName}`);
        });
        
        console.log('');
        
        // Paso 5: Verificar datos iniciales
        console.log('📊 Paso 5: Verificando datos iniciales...\n');
        
        try {
            const [categorias] = await sequelize.query(
                'SELECT codigo, nombre FROM categorias_orden ORDER BY orden_display'
            );
            
            if (categorias.length > 0) {
                console.log(`   ✅ Categorías (${categorias.length}):\n`);
                categorias.forEach(cat => {
                    console.log(`      • ${cat.codigo.padEnd(10)} → ${cat.nombre}`);
                });
                console.log('');
            } else {
                console.log('   ⚠️  Sin categorías (se esperaban 4)\n');
            }
        } catch (err) {
            console.log('   ⚠️  No se pudieron verificar las categorías\n');
        }
        
        await sequelize.close();
        
        // Resumen
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                  ✅ SETUP COMPLETADO                      ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║  Base de datos: ${DB_NAME.padEnd(42)} ║`);
        console.log(`║  Estado: LISTO PARA USAR${' '.repeat(31)} ║`);
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log('✨ Todo listo! Ahora puedes ejecutar:\n');
        console.log('   • node test-models.js  → Probar modelos');
        console.log('   • npm start           → Iniciar servidor\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR EN EL SETUP:\n');
        console.error(`   ${error.message}\n`);
        
        // Sugerencias según el tipo de error
        if (error.message.includes('authentication') || error.message.includes('password')) {
            console.log('💡 SOLUCIÓN: Verifica las credenciales en .env\n');
            console.log('   Asegúrate de que el usuario "admin" existe en PostgreSQL:');
            console.log('   \n   sudo -u postgres psql');
            console.log('   CREATE USER admin WITH PASSWORD \'admin123\' SUPERUSER;');
            console.log('   \\q\n');
        } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
            console.log('💡 SOLUCIÓN: Inicia PostgreSQL\n');
            console.log('   sudo systemctl start postgresql');
            console.log('   sudo systemctl status postgresql\n');
        } else if (error.message.includes('does not exist') && error.message.includes('role')) {
            console.log('💡 SOLUCIÓN: Crea el usuario admin\n');
            console.log('   sudo -u postgres createuser -s admin');
            console.log('   sudo -u postgres psql -c "ALTER USER admin PASSWORD \'admin123\';"');
            console.log('');
        }
        
        console.log('📋 Archivo .env actual:\n');
        console.log(`   DB_NAME=${process.env.DB_NAME || 'modulo_logistica_db'}`);
        console.log(`   DB_USER=${process.env.DB_USER || 'admin'}`);
        console.log(`   DB_PASSWORD=${process.env.DB_PASSWORD ? '***' : '(vacío)'}`);
        console.log(`   DB_HOST=${process.env.DB_HOST || 'localhost'}`);
        console.log(`   DB_PORT=${process.env.DB_PORT || '5432'}\n`);
        
        process.exit(1);
    }
}

// Ejecutar
setupDatabase();
