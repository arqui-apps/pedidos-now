/**
 * Script de inicialización rápida de base de datos
 * Ejecutar: node init-db.js
 * 
 * Este script:
 * 1. Crea la base de datos si no existe
 * 2. Conecta a la base de datos
 * 3. Sincroniza todos los modelos (crea/actualiza tablas)
 */

require('dotenv').config();
const { initDatabase } = require('./db/db');

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SINCRONIZACIÓN
// ═══════════════════════════════════════════════════════════════════

/**
 * ACTIVAR_SINCRONIZACION: Variable para activar/desactivar la sincronización
 * - true:  Sincroniza los modelos con la base de datos
 * - false: Solo verifica la conexión sin modificar la estructura
 */
const ACTIVAR_SINCRONIZACION = false;

/**
 * MODO_SINCRONIZACION: Opciones de sincronización
 * - { alter: true }  → Actualiza las tablas existentes sin perder datos (RECOMENDADO)
 * - { force: true }  → Elimina y recrea todas las tablas (BORRA TODOS LOS DATOS)
 * - {}               → Crea solo las tablas que no existen
 */
const MODO_SINCRONIZACION = { alter: true };

// ═══════════════════════════════════════════════════════════════════

async function init() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     INICIALIZACIÓN DE BASE DE DATOS - LOGÍSTICA          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    try {
        if (!ACTIVAR_SINCRONIZACION) {
            console.log('\n⚠️  SINCRONIZACIÓN DESACTIVADA');
            console.log('   Solo se verificará la conexión a la base de datos.\n');
            
            const { testConnection } = require('./db/db');
            const connected = await testConnection();
            
            if (connected) {
                console.log('✅ Conexión exitosa. Base de datos disponible.\n');
                process.exit(0);
            } else {
                throw new Error('No se pudo conectar a la base de datos');
            }
        }
        
        // Sincronización activada
        console.log('\n🔄 SINCRONIZACIÓN ACTIVADA');
        console.log(`   Modo: ${JSON.stringify(MODO_SINCRONIZACION)}\n`);
        
        const success = await initDatabase(MODO_SINCRONIZACION);

        if (success) {
            console.log('╔═══════════════════════════════════════════════════════════╗');
            console.log('║              ✅ INICIALIZACIÓN COMPLETADA                 ║');
            console.log('║                                                           ║');
            console.log('║  La base de datos está lista para usar.                  ║');
            console.log('║  Todas las tablas han sido creadas/actualizadas.         ║');
            console.log('╚═══════════════════════════════════════════════════════════╝\n');
            process.exit(0);
        } else {
            throw new Error('Fallo en la inicialización');
        }
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\n💡 Verifica:');
        console.error('   1. MySQL está corriendo');
        console.error('   2. Las credenciales en .env son correctas');
        console.error('   3. El usuario tiene permisos para crear bases de datos\n');
        process.exit(1);
    }
}

// Ejecutar
init();
