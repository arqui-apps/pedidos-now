import { SupportRequest } from "../models/index.js";

// GET /support
export const getSupportRequests = async (req, res) => {
    try {
        const {
            id_session,
            id_delivery,
            request_status,
            page = "1",
            limit = "10",
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
        const offset = (pageNum - 1) * limitNum;

        const where = { is_active: 1 };
        if (id_session) where.id_session = parseInt(id_session, 10);
        if (id_delivery) where.id_delivery = parseInt(id_delivery, 10);
        if (request_status) where.request_status = request_status;

        const { count, rows } = await SupportRequest.findAndCountAll({
            where,
            order: [["id_support_request", "DESC"]],
            limit: limitNum,
            offset,
        });

        return res.status(200).json({
            message: "Solicitudes de soporte obtenidas correctamente",
            data: rows,
            pagination: {
                totalItems: count,
                currentPage: pageNum,
                perPage: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (error) {
        console.error("getSupportRequests error:", error);
        return res.status(500).json({ message: "Error al obtener las solicitudes de soporte" });
    }
};

// GET /support/:id
export const getSupportRequestById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || id <= 0) return res.status(400).json({ message: "id inválido" });

        const support = await SupportRequest.findOne({
            where: { id_support_request: id, is_active: 1 },
        });

        if (!support) return res.status(404).json({ message: "Solicitud de soporte no encontrada" });

        return res.status(200).json({
            message: "Solicitud de soporte obtenida correctamente",
            data: support,
        });
    } catch (error) {
        console.error("getSupportRequestById error:", error);
        return res.status(500).json({ message: "Error al obtener la solicitud de soporte" });
    }
};

// PATCH /support/:id/status
export const updateSupportStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || id <= 0) return res.status(400).json({ message: "id inválido" });

        const { request_status } = req.body;
        const VALID_STATUSES = ["pendiente", "en_proceso", "resuelto", "cancelado"];

        if (!request_status || !VALID_STATUSES.includes(request_status)) {
            return res.status(400).json({
                message: "request_status inválido",
                allowedValues: VALID_STATUSES,
            });
        }

        const support = await SupportRequest.findOne({
            where: { id_support_request: id, is_active: 1 },
        });

        if (!support) return res.status(404).json({ message: "Solicitud de soporte no encontrada" });

        await support.update({ request_status });

        return res.status(200).json({
            message: "Estado actualizado correctamente",
            data: support,
        });
    } catch (error) {
        console.error("updateSupportStatus error:", error);
        return res.status(500).json({ message: "Error al actualizar el estado" });
    }
};