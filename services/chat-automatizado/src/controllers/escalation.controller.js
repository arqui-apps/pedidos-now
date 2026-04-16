import { EscalationPayload } from "../models/index.js";

// GET /escalation
// Lista todos los payloads — el equipo de agentes consulta esto
export const getEscalations = async (req, res) => {
    try {
        const {
            id_usuario,
            id_session,
            user_type,
            problem_category,
            handoff_status,
            page = "1",
            limit = "10",
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
        const offset = (pageNum - 1) * limitNum;

        const where = { is_active: 1 };
        if (id_usuario)       where.id_usuario = parseInt(id_usuario, 10);
        if (id_session)       where.id_session = parseInt(id_session, 10);
        if (user_type)        where.user_type = user_type;
        if (problem_category) where.problem_category = problem_category;
        if (handoff_status)   where.handoff_status = handoff_status;

        const { count, rows } = await EscalationPayload.findAndCountAll({
            where,
            // No incluir conversation_history en el listado — puede ser pesado
            attributes: { exclude: ["conversation_history"] },
            order: [["id_escalation", "DESC"]],
            limit: limitNum,
            offset,
        });

        return res.status(200).json({
            message: "Escalaciones obtenidas correctamente",
            data: rows,
            pagination: {
                totalItems: count,
                currentPage: pageNum,
                perPage: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (error) {
        console.error("getEscalations error:", error);
        return res.status(500).json({ message: "Error al obtener las escalaciones" });
    }
};

// GET /escalation/:id
// Payload completo incluyendo historial — el agente abre el caso
export const getEscalationById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || id <= 0) return res.status(400).json({ message: "id inválido" });

        const payload = await EscalationPayload.findOne({
            where: { id_escalation: id, is_active: 1 },
        });

        if (!payload) return res.status(404).json({ message: "Escalación no encontrada" });

        // Marcar como recibido si estaba pendiente
        if (payload.handoff_status === "pendiente") {
            await payload.update({ handoff_status: "recibido" });
        }

        return res.status(200).json({
            message: "Escalación obtenida correctamente",
            data: payload,
        });
    } catch (error) {
        console.error("getEscalationById error:", error);
        return res.status(500).json({ message: "Error al obtener la escalación" });
    }
};

// GET /escalation/session/:id_session
// Buscar el payload por sesión — el broker lo usará para redirigir al módulo de agentes
export const getEscalationBySession = async (req, res) => {
    try {
        const id_session = parseInt(req.params.id_session, 10);
        if (!id_session || id_session <= 0) {
            return res.status(400).json({ message: "id_session inválido" });
        }

        const payload = await EscalationPayload.findOne({
            where: { id_session, is_active: 1 },
            order: [["id_escalation", "DESC"]],
        });

        if (!payload) {
            return res.status(404).json({
                message: "No hay escalación para esta sesión",
            });
        }

        // Marcar como recibido al consultarlo
        if (payload.handoff_status === "pendiente") {
            await payload.update({ handoff_status: "recibido" });
        }

        return res.status(200).json({
            message: "Payload de escalación obtenido",
            data: payload,
        });
    } catch (error) {
        console.error("getEscalationBySession error:", error);
        return res.status(500).json({ message: "Error al obtener la escalación" });
    }
};

// PATCH /escalation/:id/status
// El módulo de agentes actualiza el estado del handoff
export const updateHandoffStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || id <= 0) return res.status(400).json({ message: "id inválido" });

        const { handoff_status } = req.body;
        const VALID = ["pendiente", "recibido", "en_atencion", "cerrado"];

        if (!handoff_status || !VALID.includes(handoff_status)) {
            return res.status(400).json({
                message: "handoff_status inválido",
                allowedValues: VALID,
            });
        }

        const payload = await EscalationPayload.findOne({
            where: { id_escalation: id, is_active: 1 },
        });

        if (!payload) return res.status(404).json({ message: "Escalación no encontrada" });

        await payload.update({ handoff_status });

        return res.status(200).json({
            message: "Estado actualizado correctamente",
            data: {
                id_escalation: payload.id_escalation,
                id_session: payload.id_session,
                handoff_status: payload.handoff_status,
            },
        });
    } catch (error) {
        console.error("updateHandoffStatus error:", error);
        return res.status(500).json({ message: "Error al actualizar el estado" });
    }
};