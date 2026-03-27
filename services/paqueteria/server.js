require('dotenv').config();

const app = require('./src/app');
const sequelize = require('./src/config/database');
const initModels = require('./src/models/init-models');

const models = initModels(sequelize);

sequelize.authenticate()
  .then(() => {
    console.log("Conectado a MySQL");

    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));