import { Mensaje, ChatSession } from "../models/index.js";

// GET /message?id_session=X
export const getMessages = async (req, res) => {
    try {
        const { id_session } = req.query;

        if (!id_session) {
            return res.status(400).json({ message: "id_session es obligatorio" });
        }

        const sessionId = parseInt(id_session, 10);
        if (!sessionId || sessionId <= 0) {
            return res.status(400).json({ message: "id_session inválido" });
        }

        const session = await ChatSession.findByPk(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Sesión no encontrada" });
        }

        const messages = await Mensaje.findAll({
            where: { id_session: sessionId, is_active: 1 },
            order: [["id_mensaje", "ASC"]],
        });

        return res.status(200).json({
            message: "Mensajes obtenidos correctamente",
            data: messages.map((m) => ({
                id_mensaje: m.id_mensaje,
                sender: m.message_sender,
                content: m.message_content,
                sent_time: m.sent_time,
            })),
        });
    } catch (error) {
        console.error("getMessages error:", error);
        return res.status(500).json({ message: "Error al obtener los mensajes" });
    }
};