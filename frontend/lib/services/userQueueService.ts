import { apiService } from "../api";

// Types matching backend schema
export interface QueueHistoryItem {
  queueId: string;
  queueName: string;
  location: string;
  token: string;
  joinedAt: string;
  servedAt?: string | null;
  cancelledAt?: string | null;
  status: "served" | "cancelled" | "completed" | "skipped";
  waitTimeMinutes: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  queueId?: string;
  queueName?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface CurrentQueue {
  id: string;
  queueId: string;
  queueName: string;
  location: string;
  tokenNumber: string;
  currentPosition: number;
  estimatedWaitTime: number; // in minutes
  joinedAt: string;
  status: "waiting" | "served" | "completed" | "expired" | "cancelled" | "skipped";
  expireAt?: string;
}

export interface UserState {
  userId: string;
  isInQueue: boolean;
  queueId?: string; // only if isInQueue is true
}

export interface UserQueueStats {
  totalQueuesJoined: number;
  averageWaitTime: number;
  totalServed: number;
  totalCancelled: number;
  thisMonthQueues: number;
}

class UserQueueService {
  private api = apiService;

  async getQueueHistory(): Promise<{ data: QueueHistoryItem[] }> {
    try {
      const response = await this.api.get("/user-status/history", true);
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching queue history:", error);
      throw error;
    }
  }

  async getNotifications(
    unreadOnly: boolean = false
  ): Promise<{ data: UserNotification[] }> {
    try {
      const endpoint = unreadOnly
        ? "/user-status/notifications?unread=true"
        : "/user-status/notifications";
      const response = await this.api.get(endpoint, true);
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await this.api.put(
        `/user-status/notifications/${notificationId}/read`,
        {},
        true
      );
      return { success: response.success };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async getCurrentQueue(): Promise<{ data: CurrentQueue | null }> {
    try {
      const response = await this.api.get("/user-status/current-queue", true);
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching current queue:", error);
      throw error;
    }
  }

  async getUserState(): Promise<{ data: UserState }> {
    try {
      const response = await this.api.get("/user-status/state", true);
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching user state:", error);
      throw error;
    }
  }

  async leaveCurrentQueue(): Promise<{ success: boolean }> {
    try {
      const response = await this.api.post("/user-status/leave-queue", {}, true);
      return { success: response.success };
    } catch (error) {
      console.error("Error leaving queue:", error);
      throw error;
    }
  }

  async getUserStats(): Promise<{ data: UserQueueStats }> {
    try {
      const response = await this.api.get("/user-status/stats", true);
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  async joinQueue(queueId: string): Promise<{ data: CurrentQueue }> {
    try {
      const response = await this.api.post(
        "/user-status/join-queue",
        { queueId },
        true
      );
      return { data: response.data };
    } catch (error) {
      console.error("Error joining queue:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const userQueueService = new UserQueueService();
