import { Router } from 'express';
import { startSession } from '../controllers/session.controller.js';

const router = Router();

router.post('/', startSession);

export default router;
