const env = require('../src/config/env.cjs');

module.exports = {
  development: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'mysql'
  },
  test: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'mysql'
  },
  production: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'mysql'
  }
};
