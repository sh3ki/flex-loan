import { Router } from 'express';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
} from './loan.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getLoans);
router.get('/:id', getLoanById);
router.post('/', createLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

export default router;
