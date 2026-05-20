const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'src/database/migrations');

function convertirMysqlAPostgres(sql) {
    // Reemplazar backticks por comillas dobles
    sql = sql.replace(/`/g, '"');
    
    // Reemplazar AUTO_INCREMENT por SERIAL
    sql = sql.replace(/\bINT\s+AUTO_INCREMENT\b/gi, 'SERIAL');
    sql = sql.replace(/\bBIGINT\s+AUTO_INCREMENT\b/gi, 'BIGSERIAL');
    
    // Cambiar INT a INTEGER (más compatible)
    sql = sql.replace(/\bINT\b(?!\s*\()/g, 'INTEGER');
    sql = sql.replace(/\bTINYINT\b/gi, 'SMALLINT');
    sql = sql.replace(/\bBIGINT\b/gi, 'BIGINT');
    
    // Cambiar UNSIGNED (no existe en PostgreSQL)
    sql = sql.replace(/\s+UNSIGNED\b/gi, '');
    
    // Cambiar CURRENT_TIMESTAMP()
    sql = sql.replace(/CURRENT_TIMESTAMP\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP');
    
    // Cambiar COLLATE
    sql = sql.replace(/\s+COLLATE\s+\w+/gi, '');
    
    // Cambiar ENGINE
    sql = sql.replace(/\s*ENGINE\s*=\s*\w+/gi, '');
    
    // Cambiar DEFAULT CHARSET
    sql = sql.replace(/\s*DEFAULT\s+CHARSET\s*=\s*\w+/gi, '');
    
    // Cambiar KEY a INDEX (pero mantener PRIMARY KEY)
    sql = sql.replace(/(\s+)KEY\s+(\w+)\s+\(/gi, '$1INDEX $2 (');
    
    // Cambiar UNIQUE KEY a UNIQUE INDEX
    sql = sql.replace(/\bUNIQUE\s+KEY\b/gi, 'UNIQUE INDEX');
    
    // Cambiar CONSTRAINT FOREIGN KEY a CONSTRAINT (PostgreSQL lo sabe implícitamente)
    // Pero mantener FOREIGN KEY
    
    // Cambiar ON DELETE CASCADE / UPDATE CASCADE al final
    
    return sql;
}

function main() {
    const archivos = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`🔄 Convirtiendo ${archivos.length} migraciones de MySQL a PostgreSQL...\n`);

    for (const archivo of archivos) {
        const rutaCompleta = path.join(MIGRATIONS_DIR, archivo);
        const sqlOriginal = fs.readFileSync(rutaCompleta, 'utf8');
        const sqlConvertido = convertirMysqlAPostgres(sqlOriginal);

        if (sqlOriginal !== sqlConvertido) {
            fs.writeFileSync(rutaCompleta, sqlConvertido);
            console.log(`✅ ${archivo}`);
        } else {
            console.log(`⏭️  ${archivo} (sin cambios)`);
        }
    }

    console.log('\n✅ Conversión completada.');
}

main();