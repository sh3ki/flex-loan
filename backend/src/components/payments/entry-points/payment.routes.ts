import { Router } from 'express';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from './payment.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;
