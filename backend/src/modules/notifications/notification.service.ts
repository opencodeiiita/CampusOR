import { Types } from "mongoose";
import { Notification, NotificationType } from "./notification.model.js";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  queueId?: string | null;
  queueName?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  const { userId, title, message, type = "info", queueId, queueName } = input;

  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }

  return Notification.create({
    userId: new Types.ObjectId(userId),
    queueId:
      queueId && Types.ObjectId.isValid(queueId)
        ? new Types.ObjectId(queueId)
        : null,
    queueName: queueName || null,
    title,
    message,
    type,
  });
}

export async function getNotificationsForUser(
  userId: string,
  unreadOnly = false,
) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user id");
  }

  const notifications = await Notification.find({
    userId: new Types.ObjectId(userId),
    ...(unreadOnly ? { isRead: false } : {}),
  })
    .sort({ createdAt: -1 })
    .lean();

  return notifications.map((notification) => ({
    id: notification._id.toString(),
    userId: notification.userId.toString(),
    queueId: notification.queueId ? notification.queueId.toString() : undefined,
    queueName: notification.queueName || undefined,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    readAt: notification.readAt?.toISOString(),
  }));
}

export async function markNotificationRead(userId: string, notificationId: string) {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(notificationId)) {
    return false;
  }

  const result = await Notification.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    },
    {
      isRead: true,
      readAt: new Date(),
    },
    { new: true },
  );

  return !!result;
}
