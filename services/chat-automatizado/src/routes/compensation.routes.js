import { Router } from 'express';
import {
    getCompensations,
    getCompensationById,
    validateCoupon,
} from '../controllers/compensation.controller.js';

const router = Router();

router.get('/', getCompensations);
router.get('/validate/:cupon_code', validateCoupon);
router.get('/:id', getCompensationById);

export default router;