import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Get all notifications
router.get('/', NotificationController.getNotifications);

// Get unread notifications
router.get('/unread', NotificationController.getUnreadNotifications);

// Get unread count
router.get('/unread/count', NotificationController.getUnreadCount);

// Check and create notifications
router.post('/check', NotificationController.checkAndCreateNotifications);

// Mark notification as read
router.patch('/:notificationId/read', NotificationController.markAsRead);

// Mark all as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router;
