import { Router } from 'express';
import {
    getSupportRequests,
    getSupportRequestById,
    updateSupportStatus,
} from '../controllers/support.controller.js';

const router = Router();

router.get('/', getSupportRequests);
router.get('/:id', getSupportRequestById);
router.patch('/:id/status', updateSupportStatus);

export default router;