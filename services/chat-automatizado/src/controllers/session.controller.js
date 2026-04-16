import * as chatService from "../services/chat.Service.js";
import { ChatSession } from "../models/index.js";

// POST /session
export const startSession = async (req, res) => {
    try {
        const { id_usuario, user_type } = req.body;

        if (!id_usuario || !user_type) {
            return res.status(400).json({
                message: "id_usuario y user_type son obligatorios",
            });
        }

        const VALID_USER_TYPES = ["cliente", "repartidor", "negocio"];
        if (!VALID_USER_TYPES.includes(user_type)) {
            return res.status(400).json({
                message: "user_type inválido",
                allowedValues: VALID_USER_TYPES,
            });
        }

        const result = await chatService.startSession({ id_usuario, user_type });

        return res.status(result.resumed ? 200 : 201).json({
            message: result.resumed
                ? "Sesión activa retomada"
                : "Sesión iniciada correctamente",
            data: result,
        });
    } catch (error) {
        console.error("startSession error:", error);
        return res.status(500).json({
            message: error.message || "Error al iniciar la sesión",
        });
    }
};

// POST /session/message
export const sendMessage = async (req, res) => {
    try {
        const { id_session, input, input_type } = req.body;

        if (!id_session || input === undefined || input === null) {
            return res.status(400).json({
                message: "id_session e input son obligatorios",
            });
        }

        const result = await chatService.sendMessage({
            id_session,
            input,
            input_type: input_type || null,
        });

        return res.status(200).json({
            message: "Mensaje procesado correctamente",
            data: result,
        });
    } catch (error) {
        console.error("sendMessage error:", error);
        if (
            error.message === "Sesión no encontrada" ||
            error.message === "La sesión ya no está activa"
        ) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({
            message: error.message || "Error al procesar el mensaje",
        });
    }
};

// GET /session/:id
export const getSession = async (req, res) => {
    try {
        const id_session = parseInt(req.params.id, 10);
        if (!id_session || id_session <= 0) {
            return res.status(400).json({ message: "id de sesión inválido" });
        }

        const session = await ChatSession.findByPk(id_session);
        if (!session) {
            return res.status(404).json({ message: "Sesión no encontrada" });
        }

        return res.status(200).json({
            message: "Sesión obtenida correctamente",
            data: {
                id_session: session.id_session,
                id_usuario: session.id_usuario,
                user_type: session.user_type,
                current_state: session.current_state,
                previous_state: session.previous_state,
                session_status: session.session_status,
                resolution: session.resolution,
                start_time: session.start_time,
                end_time: session.end_time,
            },
        });
    } catch (error) {
        console.error("getSession error:", error);
        return res.status(500).json({ message: "Error al obtener la sesión" });
    }
};

// GET /session/:id/history
export const getSessionHistory = async (req, res) => {
    try {
        const id_session = parseInt(req.params.id, 10);
        if (!id_session || id_session <= 0) {
            return res.status(400).json({ message: "id de sesión inválido" });
        }

        const session = await ChatSession.findByPk(id_session);
        if (!session) {
            return res.status(404).json({ message: "Sesión no encontrada" });
        }

        const messages = await chatService.getHistory(id_session);

        return res.status(200).json({
            message: "Historial obtenido correctamente",
            data: {
                id_session,
                user_type: session.user_type,
                session_status: session.session_status,
                resolution: session.resolution,
                messages: messages.map((m) => ({
                    id_mensaje: m.id_mensaje,
                    sender: m.message_sender,
                    content: m.message_content,
                    sent_time: m.sent_time,
                })),
            },
        });
    } catch (error) {
        console.error("getSessionHistory error:", error);
        return res.status(500).json({ message: "Error al obtener el historial" });
    }
};

// PATCH /session/:id/close
export const closeSession = async (req, res) => {
    try {
        const id_session = parseInt(req.params.id, 10);
        if (!id_session || id_session <= 0) {
            return res.status(400).json({ message: "id de sesión inválido" });
        }

        const session = await ChatSession.findByPk(id_session);
        if (!session) {
            return res.status(404).json({ message: "Sesión no encontrada" });
        }

        if (session.session_status !== "active") {
            return res.status(400).json({ message: "La sesión ya no está activa" });
        }

        await session.update({
            session_status: "inactive",
            resolution: "cerrado_sin_resolver",
            end_time: new Date(),
        });

        return res.status(200).json({
            message: "Sesión cerrada correctamente",
            data: { id_session, resolution: "cerrado_sin_resolver" },
        });
    } catch (error) {
        console.error("closeSession error:", error);
        return res.status(500).json({ message: "Error al cerrar la sesión" });
    }
};