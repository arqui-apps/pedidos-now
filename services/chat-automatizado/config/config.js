import env from '../src/config/env.js';

export default {
  development: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'mysql'
  }
};
