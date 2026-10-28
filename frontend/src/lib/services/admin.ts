import { api } from "@/lib/api";


export interface AdminStats {
  total_users: number;
  total_complaints: number;
  pending_complaints: number;
  processed_complaints: number;
  total_lawyers: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  timestamp: string;
  metadata: any;
}

export interface AdminLawyer {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  specialization: string;
  bio: string;
  is_available: boolean;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get("admin/stats");

    return res.data;

  },

  getUsers: async (page = 1, limit = 50): Promise<AdminUser[]> => {
    const res = await api.get("admin/users", { params: { page, limit } });

    return res.data;

  },

  getLawyers: async (): Promise<AdminLawyer[]> => {
    const res = await api.get("admin/lawyers");

    return res.data;

  },

  getAllComplaints: async (page = 1, limit = 50): Promise<any[]> => {
    const res = await api.get("cases", { params: { page, limit } });

    return res.data;

  },

  getAuditLogs: async (page = 1, limit = 50): Promise<AuditLogEntry[]> => {
    const res = await api.get("admin/audit-logs", { params: { page, limit } });

    return res.data;

  },

  suspendUser: async (userId: string): Promise<any> => {
    const res = await api.patch(`admin/users/${userId}/suspend`);

    return res.data;

  },

  activateUser: async (userId: string): Promise<any> => {
    const res = await api.patch(`admin/users/${userId}/activate`);

    return res.data;

  },

  getComplaintCoordinates: async (): Promise<{ lat: number; lng: number; count: number }[]> => {
    const res = await api.get("admin/complaints/coordinates");

    return res.data;

  },

  updateComplaintStatus: async (id: string, status: string): Promise<any> => {
    const res = await api.put(`admin/complaints/${id}/status`, { status });

    return res.data;

  },
};
