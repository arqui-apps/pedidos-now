import { Router } from 'express';
import {
  createFaq,
  deleteFaq,
  getFaqById,
  getFaqs,
  updateFaq,
} from '../controllers/faq.controller.js';

const router = Router();

router.get('/', getFaqs);
router.get('/:id', getFaqById);
router.post('/', createFaq);
router.patch('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;
