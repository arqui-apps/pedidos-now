import { Op } from "sequelize";
import pool from "../config/database.js";

// GET /inquiry
export const getInquiries = async (req, res) => {
    try {
        const {
            id_session,
            inquiry_type,
            result_found,
            page = "1",
            limit = "10",
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
        const offset = (pageNum - 1) * limitNum;

        const whereClauses = ["is_active = 1"];
        const params = [];

        if (id_session) {
            whereClauses.push("id_session = ?");
            params.push(parseInt(id_session, 10));
        }

        if (inquiry_type) {
            const VALID_TYPES = ["pedido", "cliente", "repartidor"];
            if (!VALID_TYPES.includes(inquiry_type)) {
                return res.status(400).json({
                    message: "inquiry_type inválido",
                    allowedValues: VALID_TYPES,
                });
            }
            whereClauses.push("inquiry_type = ?");
            params.push(inquiry_type);
        }

        if (result_found !== undefined) {
            whereClauses.push("result_found = ?");
            params.push(result_found === "true" ? 1 : 0);
        }

        const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total FROM order_inquiry ${whereSQL}`,
            params
        );
        const total = countRows[0].total;

        const [rows] = await pool.query(
            `SELECT * FROM order_inquiry ${whereSQL} ORDER BY inquiry_time DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        return res.status(200).json({
            message: "Consultas obtenidas correctamente",
            data: rows,
            pagination: {
                totalItems: total,
                currentPage: pageNum,
                perPage: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("getInquiries error:", error);
        return res.status(500).json({ message: "Error al obtener las consultas" });
    }
};

// GET /inquiry/:id
export const getInquiryById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || id <= 0) return res.status(400).json({ message: "id inválido" });

        const [rows] = await pool.query(
            "SELECT * FROM order_inquiry WHERE id_inquiry = ? AND is_active = 1 LIMIT 1",
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Consulta no encontrada" });
        }

        return res.status(200).json({
            message: "Consulta obtenida correctamente",
            data: rows[0],
        });
    } catch (error) {
        console.error("getInquiryById error:", error);
        return res.status(500).json({ message: "Error al obtener la consulta" });
    }
};