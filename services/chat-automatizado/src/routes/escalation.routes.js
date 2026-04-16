import { Router } from "express";
import {
    getEscalations,
    getEscalationById,
    getEscalationBySession,
    updateHandoffStatus,
} from "../controllers/escalation.controller.js";

const router = Router();

router.get("/", getEscalations);
router.get("/session/:id_session", getEscalationBySession);
router.get("/:id", getEscalationById);
router.patch("/:id/status", updateHandoffStatus);

export default router;