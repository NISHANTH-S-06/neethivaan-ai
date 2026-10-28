import { api } from "@/lib/api";


export interface Notification {
  id: string;
  type: "case_update" | "admin_action" | "system";
  title: string;
  message: string;
  case_id?: string;
  read: boolean;
  created_at: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const { data } = await api.get("notifications");

      return data;
    } catch {
      // Gracefully return empty if endpoint not ready
      return [];
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await api.post(`notifications/${id}/read`);

    } catch {
      // Non-fatal
    }
  },

  markAllRead: async (): Promise<void> => {
    try {
      await api.post("notifications/read-all");

    } catch {
      // Non-fatal
    }
  },
};
