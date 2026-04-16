import { Compensation } from "../models/index.js";
import { Op } from "sequelize";

// GET /compensation
export const getCompensations = async (req, res) => {
    try {
        const {
            id_usuario,
            id_session,
            compensation_type,
            compensation_status,
            page = "1",
            limit = "10",
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
        const offset = (pageNum - 1) * limitNum;

        const where = { is_active: 1 };

        if (id_usuario) where.id_usuario = parseInt(id_usuario, 10);
        if (id_session) where.id_session = parseInt(id_session, 10);
        if (compensation_type) where.compensation_type = compensation_type;
        if (compensation_status) where.compensation_status = compensation_status;

        const { count, rows } = await Compensation.findAndCountAll({
            where,
            order: [["id_compensacion", "DESC"]],
            limit: limitNum,
            offset,
        });

        return res.status(200).json({
            message: "Compensaciones obtenidas correctamente",
            data: rows,
            pagination: {
                totalItems: count,
                currentPage: pageNum,
                perPage: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (error) {
        console.error("getCompensations error:", error);
        return res.status(500).json({ message: "Error al obtener las compensaciones" });
    }
};

// GET /compensation/:id
export const getCompensationById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || id <= 0) return res.status(400).json({ message: "id inválido" });

        const comp = await Compensation.findOne({
            where: { id_compensacion: id, is_active: 1 },
        });

        if (!comp) return res.status(404).json({ message: "Compensación no encontrada" });

        return res.status(200).json({
            message: "Compensación obtenida correctamente",
            data: comp,
        });
    } catch (error) {
        console.error("getCompensationById error:", error);
        return res.status(500).json({ message: "Error al obtener la compensación" });
    }
};

// GET /compensation/validate/:cupon_code
export const validateCoupon = async (req, res) => {
    try {
        const { cupon_code } = req.params;

        if (!cupon_code) return res.status(400).json({ message: "cupon_code es obligatorio" });

        const comp = await Compensation.findOne({
            where: {
                cupon_code,
                compensation_type: "cupon",
                is_active: 1,
            },
        });

        if (!comp) {
            return res.status(404).json({
                valid: false,
                message: "Cupón no encontrado",
            });
        }

        const now = new Date();

        if (comp.compensation_status === "usado") {
            return res.status(200).json({ valid: false, message: "El cupón ya fue utilizado" });
        }

        if (comp.compensation_status === "expirado") {
            return res.status(200).json({ valid: false, message: "El cupón ha expirado" });
        }

        if (comp.expiration_date && new Date(comp.expiration_date) < now) {
            // Actualizar estado a expirado automáticamente
            await comp.update({ compensation_status: "expirado" });
            return res.status(200).json({ valid: false, message: "El cupón ha expirado" });
        }

        return res.status(200).json({
            valid: true,
            message: "Cupón válido",
            data: {
                cupon_code: comp.cupon_code,
                amount: comp.amount,
                expiration_date: comp.expiration_date,
                compensation_status: comp.compensation_status,
            },
        });
    } catch (error) {
        console.error("validateCoupon error:", error);
        return res.status(500).json({ message: "Error al validar el cupón" });
    }
};