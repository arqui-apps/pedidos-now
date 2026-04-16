import { Router } from 'express';
import { getMenu } from '../controllers/menu.controller.js';

const router = Router();

router.get('/', getMenu);

export default router;