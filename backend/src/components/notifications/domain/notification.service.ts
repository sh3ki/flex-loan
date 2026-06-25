import { NotificationRepository } from '../data-access/notification.repository';
import { prisma } from '../../../shared/utils/prisma.client';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  async getUserNotifications(userId: string) {
    return this.repository.findUserNotifications(userId);
  }

  async getUnreadNotifications(userId: string) {
    return this.repository.findUnreadNotifications(userId);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.repository.markAsRead(notificationId);
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId: string) {
    return this.repository.deleteNotification(notificationId);
  }

  async getUnreadCount(userId: string) {
    return this.repository.getUnreadCount(userId);
  }

  /**
   * Check and create notifications for all loans
   * Runs periodically to generate notifications based on loan dates
   */
  async checkAndCreateNotifications(userId: string) {
    const now = new Date();
    const loans = await prisma.loan.findMany({
      where: {
        userId,
        status: 'active',
        deletedAt: null,
      },
      include: {
        creditor: true,
      },
    });

    for (const loan of loans) {
      // Calculate dates for notifications
      const dueDate = new Date(loan.dueDate);
      const releaseDate = new Date(loan.releaseDate);

      // Check for release date notification
      const releaseDateOnly = new Date(releaseDate.setHours(0, 0, 0, 0));
      const nowDateOnly = new Date(now.setHours(0, 0, 0, 0));

      if (releaseDateOnly.getTime() === nowDateOnly.getTime()) {
        const releaseExists = await this.repository.checkNotificationExists(
          loan.id,
          'release_date'
        );
        if (!releaseExists) {
          await this.repository.createNotification({
            type: 'release_date',
            title: `Loan ${loan.loanNumber} Released`,
            description: `Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} has been released.`,
            loanId: loan.id,
            userId,
            triggerDate: releaseDate,
          });
        }
      }

      // Check for due date notifications
      const daysUntilDue = Math.floor(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 1 week before due date
      if (daysUntilDue === 7) {
        const weekExists = await this.repository.checkNotificationExists(
          loan.id,
          'due_1week'
        );
        if (!weekExists) {
          const weekNotifyDate = new Date(dueDate);
          weekNotifyDate.setDate(weekNotifyDate.getDate() - 7);
          await this.repository.createNotification({
            type: 'due_1week',
            title: `Loan ${loan.loanNumber} Due in 1 Week`,
            description: `Payment reminder: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is due in 1 week.`,
            loanId: loan.id,
            userId,
            triggerDate: weekNotifyDate,
          });
        }
      }

      // 1 day before due date
      if (daysUntilDue === 1) {
        const dayExists = await this.repository.checkNotificationExists(
          loan.id,
          'due_1day'
        );
        if (!dayExists) {
          const dayNotifyDate = new Date(dueDate);
          dayNotifyDate.setDate(dayNotifyDate.getDate() - 1);
          await this.repository.createNotification({
            type: 'due_1day',
            title: `Loan ${loan.loanNumber} Due Tomorrow`,
            description: `Payment reminder: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is due tomorrow.`,
            loanId: loan.id,
            userId,
            triggerDate: dayNotifyDate,
          });
        }
      }

      // Exact due date
      if (daysUntilDue === 0) {
        const dueExists = await this.repository.checkNotificationExists(
          loan.id,
          'due_today'
        );
        if (!dueExists) {
          await this.repository.createNotification({
            type: 'due_today',
            title: `Loan ${loan.loanNumber} Due Today`,
            description: `Payment due today: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is due today.`,
            loanId: loan.id,
            userId,
            triggerDate: dueDate,
          });
        }
      }
    }

    return this.repository.findUserNotifications(userId);
  }
}
