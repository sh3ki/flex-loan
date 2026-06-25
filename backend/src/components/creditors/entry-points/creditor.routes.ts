import { Router } from 'express';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import {
  getCreditors,
  getCreditorById,
  createCreditor,
  updateCreditor,
  deleteCreditor,
  restoreCreditor,
} from './creditor.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCreditors);
router.get('/:id', getCreditorById);
router.post('/', createCreditor);
router.put('/:id', updateCreditor);
router.delete('/:id', deleteCreditor);
router.post('/:id/restore', restoreCreditor);

export default router;
