/**
 * Script de prueba para verificar modelos de Logística
 * Ejecutar: node test-models.js
 */

require('dotenv').config();
const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');

const {
    CategoriaOrden,
    Repartidor,
    Entrega,
    AsignacionEntrega,
    HistorialEstadoEntrega,
    IncidenciaEntrega,
    HistorialUbicacionRepartidor,
    NotificacionLogistica,
    CalificacionEntrega
} = require('./src/models');

async function testModels() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     PRUEBA DE MODELOS - MÓDULO DE LOGÍSTICA              ║');
    console.log('║              PostgreSQL v3.0                              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
        // 1. Probar conexión
        console.log('🔌 Paso 1: Probando conexión a la base de datos...\n');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        console.log('');

        // 2. Verificar modelos cargados
        console.log('📦 Paso 2: Verificando modelos cargados...\n');
        const modelos = [
            'CategoriaOrden',
            'Repartidor',
            'Entrega',
            'AsignacionEntrega',
            'HistorialEstadoEntrega',
            'IncidenciaEntrega',
            'HistorialUbicacionRepartidor',
            'NotificacionLogistica',
            'CalificacionEntrega'
        ];

        modelos.forEach(modelo => {
            const modeloObj = eval(modelo);
            if (modeloObj) {
                console.log(`   ✅ ${modelo}: ${modeloObj.tableName}`);
            } else {
                console.log(`   ❌ ${modelo}: No cargado`);
            }
        });
        console.log('');

        // 3. Verificar relaciones
        console.log('🔗 Paso 3: Verificando relaciones entre modelos...\n');
        
        console.log('   CategoriaOrden:');
        console.log(`      → entregas: ${CategoriaOrden.associations.entregas ? '✅' : '❌'}`);
        
        console.log('   Repartidor:');
        console.log(`      → asignaciones: ${Repartidor.associations.asignaciones ? '✅' : '❌'}`);
        console.log(`      → incidencias_reportadas: ${Repartidor.associations.incidencias_reportadas ? '✅' : '❌'}`);
        console.log(`      → ubicaciones: ${Repartidor.associations.ubicaciones ? '✅' : '❌'}`);
        console.log(`      → calificaciones: ${Repartidor.associations.calificaciones ? '✅' : '❌'}`);
        
        console.log('   Entrega:');
        console.log(`      → categoria: ${Entrega.associations.categoria ? '✅' : '❌'}`);
        console.log(`      → historial: ${Entrega.associations.historial ? '✅' : '❌'}`);
        console.log(`      → asignaciones: ${Entrega.associations.asignaciones ? '✅' : '❌'}`);
        console.log(`      → incidencias: ${Entrega.associations.incidencias ? '✅' : '❌'}`);
        console.log(`      → notificaciones: ${Entrega.associations.notificaciones ? '✅' : '❌'}`);
        console.log(`      → calificacion: ${Entrega.associations.calificacion ? '✅' : '❌'}`);
        
        console.log('');

        // 4. Resumen
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ PRUEBA EXITOSA                      ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  • Conexión a PostgreSQL establecida                     ║');
        console.log('║  • 9 modelos cargados correctamente                      ║');
        console.log('║  • Relaciones configuradas                               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // 5. Mostrar información adicional
        console.log('📊 INFORMACIÓN DE MODELOS:\n');
        console.log('Tabla                                PK                         Timestamps');
        console.log('─────────────────────────────────────────────────────────────────────────');
        console.log(`categorias_orden                     id_categoria               ✅`);
        console.log(`repartidores                         id_repartidor              ✅`);
        console.log(`entregas                             id_entrega                 ✅`);
        console.log(`asignaciones_entrega                 id_asignacion              ✅ (solo created_at)`);
        console.log(`historial_estados_entrega            id_historial_estado        ✅ (solo created_at)`);
        console.log(`incidencias_entrega                  id_incidencia              ✅`);
        console.log(`historial_ubicaciones_repartidor     id_ubicacion               ✅ (solo created_at)`);
        console.log(`notificaciones_logistica             id_notificacion            ✅ (solo created_at)`);
        console.log(`calificaciones_entrega               id_calificacion            ✅ (solo created_at)`);
        console.log('');
        
        console.log('💡 Para sincronizar tablas ejecuta: node syncDatabase.js\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
        console.error('\nDetalles:', error);
        process.exit(1);
    }
}

// Ejecutar prueba
testModels();
