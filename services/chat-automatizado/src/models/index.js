import { Sequelize, DataTypes } from "sequelize";
import "dotenv/config";

import ChatSessionModel from "./ChatSession.js";
import MensajeModel from "./Mensaje.js";
import MenuModel from "./Menu.js";
import OptionChoiceModel from "./OptionChoice.js";
import CompensationModel from "./Compensation.js";
import SupportRequestModel from "./SupportRequest.js";
import EscalationPayloadModel from "./EscalationPayload.js";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: false,
    }
);

const ChatSession = ChatSessionModel(sequelize, DataTypes);
const Mensaje = MensajeModel(sequelize, DataTypes);
const Menu = MenuModel(sequelize, DataTypes);
const OptionChoice = OptionChoiceModel(sequelize, DataTypes);
const Compensation = CompensationModel(sequelize, DataTypes);
const SupportRequest = SupportRequestModel(sequelize, DataTypes);
const Faq = FaqModel(sequelize, DataTypes);
const EscalationPayload = EscalationPayloadModel(sequelize, DataTypes);

ChatSession.hasMany(Mensaje, { foreignKey: "id_session" });
Mensaje.belongsTo(ChatSession, { foreignKey: "id_session" });

ChatSession.hasMany(Compensation, { foreignKey: "id_session" });
Compensation.belongsTo(ChatSession, { foreignKey: "id_session" });

ChatSession.hasMany(SupportRequest, { foreignKey: "id_session" });
SupportRequest.belongsTo(ChatSession, { foreignKey: "id_session" });

ChatSession.hasMany(EscalationPayload, { foreignKey: "id_session" });
EscalationPayload.belongsTo(ChatSession, { foreignKey: "id_session" });

Menu.hasMany(OptionChoice, { foreignKey: "id_menu" });
OptionChoice.belongsTo(Menu, { foreignKey: "id_menu" });

export {
    sequelize,
    ChatSession,
    Mensaje,
    Menu,
    OptionChoice,
    Compensation,
    SupportRequest,
    EscalationPayload,
};