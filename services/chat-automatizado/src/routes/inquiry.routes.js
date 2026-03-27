import { Router } from 'express';
import { getInquiries } from '../controllers/inquiry.controller.js';

const router = Router();

router.get('/', getInquiries);

export default router;
