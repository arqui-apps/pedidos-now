import { Router } from 'express';
import { createCompensation } from '../controllers/compensation.controller.js';

const router = Router();

router.post('/', createCompensation);

export default router;
