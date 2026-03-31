// src/models/index.js
"use strict";

const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// 1. CREAR LA CONEXIÓN
//    Le decimos a Sequelize dónde está nuestra base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME,      // "chatbot"
    process.env.DB_USER,      // "root"
    process.env.DB_PASS,      // "tu_password"
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: false, // cambiar a console.log si quieres ver el SQL generado
    }
);

// 2. REGISTRAR LOS MODELOS
//    Cada modelo recibe sequelize y DataTypes para definir sus columnas
const ChatSession   = require("./ChatSession")(sequelize, DataTypes);
const Mensaje       = require("./Mensaje")(sequelize, DataTypes);
const Menu          = require("./Menu")(sequelize, DataTypes);
const OptionChoice  = require("./OptionChoice")(sequelize, DataTypes);
const Compensation  = require("./Compensation")(sequelize, DataTypes);
const SupportRequest = require("./SupportRequest")(sequelize, DataTypes);
const Faq           = require("./Faq")(sequelize, DataTypes);

// 3. DEFINIR RELACIONES (equivalente a los FOREIGN KEY de tu SQL)
//    Esto permite hacer queries con JOIN usando Sequelize

// Una sesión tiene muchos mensajes
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