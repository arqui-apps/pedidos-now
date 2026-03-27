import { Router } from 'express';
import { getSupport } from '../controllers/support.controller.js';

const router = Router();

router.get('/', getSupport);

export default router;
