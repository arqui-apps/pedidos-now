import { Router } from 'express';
import { getInquiries, getInquiryById } from '../controllers/inquiry.controller.js';

const router = Router();

router.get('/', getInquiries);
router.get('/:id', getInquiryById);

export default router;