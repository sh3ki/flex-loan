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

  private getDateOnly(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Check and create notifications for all loans
   * Runs periodically to generate notifications based on loan dates
   */
  async checkAndCreateNotifications(userId: string) {
    const nowDateOnly = this.getDateOnly(new Date());
    let createdCount = 0;

    const loans = await prisma.loan.findMany({
      where: {
        userId,
        remainingBalance: { gt: 0 },
        deletedAt: null,
      },
      include: {
        creditor: true,
      },
    });

    for (const loan of loans) {
      const dueDate = new Date(loan.dueDate);
      const dueDateOnly = this.getDateOnly(dueDate);
      const releaseDate = new Date(loan.releaseDate);
      const releaseDateOnly = this.getDateOnly(releaseDate);

      // Check for release date notification
      if (releaseDateOnly.getTime() === nowDateOnly.getTime()) {
        const releaseExists = await this.repository.checkNotificationExists(
          loan.id,
          'release_date'
        );
        if (!releaseExists) {
          const createdRelease = await this.repository.createNotification({
            type: 'release_date',
            title: `Loan ${loan.loanNumber} Released`,
            description: `Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} has been released.`,
            loanId: loan.id,
            userId,
            triggerDate: releaseDate,
          });
          if (createdRelease) {
            createdCount += 1;
          }
        }
      }

      // Check for due date notifications
      const daysUntilDue = Math.floor(
        (dueDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24)
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
          const createdWeek = await this.repository.createNotification({
            type: 'due_1week',
            title: `Loan ${loan.loanNumber} Due in 1 Week`,
            description: `Payment reminder: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is due in 1 week.`,
            loanId: loan.id,
            userId,
            triggerDate: weekNotifyDate,
          });
          if (createdWeek) {
            createdCount += 1;
          }
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
          const createdDay = await this.repository.createNotification({
            type: 'due_1day',
            title: `Loan ${loan.loanNumber} Due Tomorrow`,
            description: `Payment reminder: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is due tomorrow.`,
            loanId: loan.id,
            userId,
            triggerDate: dayNotifyDate,
          });
          if (createdDay) {
            createdCount += 1;
          }
        }
      }

      // Exact due date
      if (daysUntilDue === 0) {
        const dueExists = await this.repository.checkNotificationExists(
          loan.id,
          'due_today'
        );
        if (!dueExists) {
          const createdDueToday = await this.repository.createNotification({
            type: 'due_today',
            title: `Loan ${loan.loanNumber} Due Today`,
            description: `Payment due today: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is due today.`,
            loanId: loan.id,
            userId,
            triggerDate: dueDate,
          });
          if (createdDueToday) {
            createdCount += 1;
          }
        }
      }

      // 1 day after due date
      if (daysUntilDue === -1) {
        const overdueExists = await this.repository.checkNotificationExists(
          loan.id,
          'due_1day_after'
        );
        if (!overdueExists) {
          const overdueNotifyDate = new Date(dueDate);
          overdueNotifyDate.setDate(overdueNotifyDate.getDate() + 1);
          const createdOverdue = await this.repository.createNotification({
            type: 'due_1day_after',
            title: `Loan ${loan.loanNumber} Overdue by 1 Day`,
            description: `Overdue reminder: Your loan to ${loan.creditor.firstName} ${loan.creditor.lastName} is now 1 day overdue.`,
            loanId: loan.id,
            userId,
            triggerDate: overdueNotifyDate,
          });
          if (createdOverdue) {
            createdCount += 1;
          }
        }
      }
    }

    return {
      hasChanges: createdCount > 0,
      createdCount,
    };
  }
}
