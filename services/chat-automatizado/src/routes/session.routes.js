import { Router } from 'express';
import {
    startSession,
    sendMessage,
    getSession,
    getSessionHistory,
    closeSession,
} from '../controllers/session.controller.js';

const router = Router();

router.post('/', startSession);
router.post('/message', sendMessage);
router.get('/:id', getSession);
router.get('/:id/history', getSessionHistory);
router.patch('/:id/close', closeSession);

export default router;