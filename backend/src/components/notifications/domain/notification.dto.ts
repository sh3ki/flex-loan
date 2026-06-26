export interface CreateNotificationDTO {
  type: 'release_date' | 'due_1week' | 'due_1day' | 'due_today' | 'due_1day_after';
  loanId: string;
  userId: string;
}

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  description: string;
  loanId: string;
  userId: string;
  isRead: boolean;
  readAt?: Date;
  triggerDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
