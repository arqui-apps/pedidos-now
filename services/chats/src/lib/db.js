// src/lib/db.js
import mysql from 'mysql2/promise';

const globalForDb = globalThis;

function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está configurada.');
  }

  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    dateStrings: true,
  };
}

export const pool =
  globalForDb.mysqlPool ||
  mysql.createPool(getDatabaseConfig());

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPool = pool;
}

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function transaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const tx = {
      query: async (sql, params = []) => {
        const [rows] = await connection.execute(sql, params);
        return rows;
      },
      execute: async (sql, params = []) => {
        const [result] = await connection.execute(sql, params);
        return result;
      },
    };

    const result = await callback(tx);

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function pingDb() {
  const rows = await query('SELECT 1 AS ok');
  return rows?.[0]?.ok === 1;
}