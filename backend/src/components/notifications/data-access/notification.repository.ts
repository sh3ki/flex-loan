import { prisma } from '../../../shared/utils/prisma.client';

export class NotificationRepository {
  async findUserNotifications(userId: string, limit: number = 50) {
    return prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        loan: {
          include: {
            creditor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async findUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      include: {
        loan: {
          include: {
            creditor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createNotification(data: {
    type: string;
    title: string;
    description: string;
    loanId: string;
    userId: string;
    triggerDate: Date;
  }) {
    return prisma.notification.create({
      data,
      include: {
        loan: {
          include: {
            creditor: true,
          },
        },
      },
    });
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        loan: {
          include: {
            creditor: true,
          },
        },
      },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return this.findUserNotifications(userId);
  }

  async deleteNotification(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async checkNotificationExists(loanId: string, type: string) {
    return prisma.notification.findFirst({
      where: {
        loanId,
        type,
        isRead: false,
        deletedAt: null,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }
}
