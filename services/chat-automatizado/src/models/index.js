"use strict";

const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// CREAR LA CONEXIÓN
const sequelize = new Sequelize(
    process.env.DB_NAME,      
    process.env.DB_USER,      
    process.env.DB_PASS,      
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: false, 
    }
);

// 2. REGISTRAR LOS MODELOS

const ChatSession   = require("./ChatSession")(sequelize, DataTypes);
const Mensaje       = require("./Mensaje")(sequelize, DataTypes);
const Menu          = require("./Menu")(sequelize, DataTypes);
const OptionChoice  = require("./OptionChoice")(sequelize, DataTypes);
const Compensation  = require("./Compensation")(sequelize, DataTypes);
const SupportRequest = require("./SupportRequest")(sequelize, DataTypes);
const Faq           = require("./Faq")(sequelize, DataTypes);

// 3. DEFINIR RELACIONES (equivalente a los FOREIGN KEY de tu SQL)
ChatSession.hasMany(Mensaje, { foreignKey: "id_session" });
Mensaje.belongsTo(ChatSession, { foreignKey: "id_session" });

// Una sesión tiene muchas compensaciones
ChatSession.hasMany(Compensation, { foreignKey: "id_session" });
Compensation.belongsTo(ChatSession, { foreignKey: "id_session" });

// Una sesión tiene muchos support requests
ChatSession.hasMany(SupportRequest, { foreignKey: "id_session" });
SupportRequest.belongsTo(ChatSession, { foreignKey: "id_session" });

// Un menú tiene muchas opciones
Menu.hasMany(OptionChoice, { foreignKey: "id_menu" });
OptionChoice.belongsTo(Menu, { foreignKey: "id_menu" });

// Exportar todo junto para usarlo en cualquier parte del proyecto
module.exports = {
    sequelize,
    ChatSession,
    Mensaje,
    Menu,
    OptionChoice,
    Compensation,
    SupportRequest,
    Faq,
};