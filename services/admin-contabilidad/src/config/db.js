require('dotenv').config();

const { Pool } = require('pg');
const { Sequelize } = require('sequelize');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Falta DATABASE_URL en variables de entorno');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sequelize = new Sequelize(
  connectionString,
  {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const normalizeQuery = (sql, params = []) => {
  let index = 0;

  const normalizedSql = sql
    .replace(/IFNULL/gi, 'COALESCE')
    .replace(/CURDATE\(\)/gi, 'CURRENT_DATE')
    .replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\?/g, () => `$${++index}`);

  return {
    sql: normalizedSql,
    params
  };
};

const query = async (sql, params = []) => {
  const normalized = normalizeQuery(sql, params);
  const result = await pool.query(normalized.sql, normalized.params);

  result[Symbol.iterator] = function* () {
    yield result.rows;
    yield result;
  };

  return result;
};

module.exports = {
  pool,
  sequelize,
  query
};