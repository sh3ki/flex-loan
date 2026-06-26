import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../domain/notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  private static getAuthenticatedUserId(req: Request): string | null {
    const user = (req as any).user;
    return user?.userId || user?.id || null;
  }

  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = NotificationController.getAuthenticatedUserId(req);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notifications = await notificationService.getUserNotifications(userId);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = NotificationController.getAuthenticatedUserId(req);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notifications = await notificationService.getUnreadNotifications(userId);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = NotificationController.getAuthenticatedUserId(req);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const unreadCount = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { notificationId } = req.params as { notificationId: string };

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      const notification = await notificationService.markNotificationAsRead(
        notificationId
      );

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = NotificationController.getAuthenticatedUserId(req);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notifications = await notificationService.markAllNotificationsAsRead(
        userId
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { notificationId } = req.params as { notificationId: string };

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      await notificationService.deleteNotification(notificationId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkAndCreateNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = NotificationController.getAuthenticatedUserId(req);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await notificationService.checkAndCreateNotifications(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
