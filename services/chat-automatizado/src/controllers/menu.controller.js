import logger from '../config/logger.js';
import { Menu, OptionChoice } from "../models/index.js";

// GET /menu?user_type=cliente&state=MENU_PRINCIPAL_CLIENTE
export const getMenu = async (req, res) => {
    try {
        const { user_type, state } = req.query;

        const where = { is_active: 1 };

        if (state) where.actual_state = state;

        if (user_type) {
            const VALID_TYPES = ["cliente", "repartidor", "negocio", "todos"];
            if (!VALID_TYPES.includes(user_type)) {
                return res.status(400).json({
                    message: "user_type inválido",
                    allowedValues: VALID_TYPES,
                });
            }
            // Traer menús que aplican para ese tipo O para todos
            where[Symbol.for("sequelize.or")] = [
                { audience_type: user_type },
                { audience_type: "todos" },
            ];
        }

        const menus = await Menu.findAll({
            where,
            include: [{ model: OptionChoice, where: { is_active: 1 }, required: false }],
            order: [["id_menu", "ASC"]],
        });

        return res.status(200).json({
            message: "Menús obtenidos correctamente",
            data: menus,
        });
    } catch (error) {
        logger.error({ err: error.message }, 'getMenu error');
        return res.status(500).json({ message: "Error al obtener los menús" });
    }
};