const sequelize = require('../config/database');
const initModels = require('./init-models');

const models = initModels(sequelize);

module.exports = models;