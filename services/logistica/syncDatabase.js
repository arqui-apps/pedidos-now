/**
 * Script de sincronización de base de datos
 * Ejecutar: node syncDatabase.js
 * 
 * - En desarrollo: crea/modifica tablas automáticamente (alter: true)
 * - En producción: solo crea tablas nuevas (alter: false)
 */

const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');

// Importar todos los modelos para que Sequelize los registre
require('./src/models');

const syncDatabase = async () => {
    try {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║        SINCRONIZACIÓN DE BASE DE DATOS                   ║');
        console.log('║              Módulo de Logística v3.0                    ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log('🔄 Iniciando sincronización de base de datos...');
        console.log(`🌍 Ambiente: ${env.NODE_ENV}\n`);
        
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        console.log('');
        
        // Sincronizar según el ambiente
        if (env.NODE_ENV === 'production') {
            // En producción: solo crea tablas nuevas, no modifica existentes
            console.log('⚙️  Modo PRODUCCIÓN: Solo creación de tablas nuevas...');
            await sequelize.sync({ alter: false });
            console.log('✅ Base de datos sincronizada (producción: sin modificaciones).\n');
        } else {
            // En desarrollo: permite modificar estructura
            console.log('⚙️  Modo DESARROLLO: Permitiendo alteraciones de estructura...');
            await sequelize.sync({ alter: true });
            console.log('✅ Base de datos sincronizada (desarrollo: con alter).\n');
        }
        
        // Verificar tablas creadas
        console.log('🔍 Verificando tablas creadas...\n');
        
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        console.log(`   📊 Total de tablas: ${tables.length}\n`);
        
        const expectedTables = [
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
        
        // Mapear los nombres de tabla de Sequelize a nombres de tabla reales
        const tableMapping = {
            'CategoriaOrden': 'categorias_orden',
            'Repartidor': 'repartidores',
            'Entrega': 'entregas',
            'AsignacionEntrega': 'asignaciones_entrega',
            'HistorialEstadoEntrega': 'historial_estados_entrega',
            'IncidenciaEntrega': 'incidencias_entrega',
            'HistorialUbicacionRepartidor': 'historial_ubicaciones_repartidor',
            'NotificacionLogistica': 'notificaciones_logistica',
            'CalificacionEntrega': 'calificaciones_entrega'
        };
        
        expectedTables.forEach(modelName => {
            const tableName = tableMapping[modelName];
            const exists = tables.some(t => t.table_name === tableName);
            console.log(`      ${exists ? '✅' : '❌'} ${modelName.padEnd(30)} → ${tableName}`);
        });
        
        console.log('');
        
        // Insertar categorías iniciales si no existen
        console.log('📦 Verificando datos iniciales...\n');
        
        const { CategoriaOrden } = require('./src/models');
        const countCategorias = await CategoriaOrden.count();
        
        if (countCategorias === 0) {
            console.log('   🔧 Insertando categorías iniciales...\n');
            
            const categoriasIniciales = [
                { codigo: 'FOOD', nombre: 'Comida', descripcion: 'Restaurantes y comida rápida', icono: 'utensils', color_hex: '#FF6B35', orden_display: 1 },
                { codigo: 'MARKET', nombre: 'Supermercado', descripcion: 'Abarrotes y productos del hogar', icono: 'shopping-cart', color_hex: '#4CAF50', orden_display: 2 },
                { codigo: 'PHARMACY', nombre: 'Farmacia', descripcion: 'Medicamentos y productos de salud', icono: 'pill', color_hex: '#2196F3', orden_display: 3 },
                { codigo: 'PACKAGE', nombre: 'Paquetería', descripcion: 'Envíos y mandados en general', icono: 'package', color_hex: '#9C27B0', orden_display: 4 }
            ];
            
            await CategoriaOrden.bulkCreate(categoriasIniciales);
            
            console.log('   ✅ Categorías creadas:\n');
            categoriasIniciales.forEach(cat => {
                console.log(`      • ${cat.codigo.padEnd(10)} → ${cat.nombre}`);
            });
            console.log('');
        } else {
            console.log(`   ✅ Ya existen ${countCategorias} categorías\n`);
        }
        
        await sequelize.close();
        
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║            ✅ SINCRONIZACIÓN COMPLETADA                   ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║  Ambiente: ${env.NODE_ENV.padEnd(48)} ║`);
        console.log(`║  Tablas: ${String(tables.length).padEnd(50)} ║`);
        console.log('║  Estado: LISTO PARA USAR                                 ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log('🚀 Siguiente paso: npm start\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR EN LA SINCRONIZACIÓN:\n');
        console.error(`   ${error.message}\n`);
        console.error('Detalles:', error);
        console.log('');
        process.exit(1);
    }
};

syncDatabase();
