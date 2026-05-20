import express from "express";
import {
  crearReportePromociones,
  obtenerReportesPromociones
} from "../controllers/admin.promociones.controller.js";

const router = express.Router();

// crear reporte
router.post("/reportes", crearReportePromociones);

// listar reportes
router.get("/reportes", obtenerReportesPromociones);

export default router;