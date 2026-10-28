import { api } from "@/lib/api";


export interface LawyerCase {
  case_id: string;
  title: string;
  description: string;
  issue_type: string;
  status: string;
  complainant_name: string;
  created_at: string;
  updated_at: string | null;
}

export interface LawyerProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  specialization: string | null;
  bio: string | null;
  is_available: boolean;
}

export interface VerificationPayload {
  bar_council_number: string;
  specialization: string;
  years_experience: number;
  bio?: string;
}

export const lawyerService = {
  getAssignedCases: async (status?: string): Promise<LawyerCase[]> => {
    const params = status ? { status } : {};
    const { data } = await api.get("lawyer/cases", { params });

    return data;
  },

  getLawyerProfile: async (): Promise<LawyerProfile> => {
    const { data } = await api.get("lawyer/me");

    return data;
  },

  updateProfile: async (payload: Partial<LawyerProfile>): Promise<void> => {
    await api.put("lawyer/me", payload);

  },

  updateCaseStatus: async (caseId: string, status: string): Promise<void> => {
    await api.post(`lawyer/cases/${caseId}/status`, { status });

  },

  addCaseNote: async (caseId: string, content: string): Promise<void> => {
    await api.post(`lawyer/cases/${caseId}/notes`, { content });

  },

  getDocumentUploadUrl: async (caseId: string, fileName: string): Promise<{ upload_url: string }> => {
    const { data } = await api.post(`lawyer/cases/${caseId}/documents`, null, {

      params: { file_name: fileName },
    });
    return data;
  },

  askAI: async (question: string): Promise<string> => {
    const { data } = await api.post("lawyer/ask", { question });

    return data.answer;
  },

  submitVerification: async (payload: VerificationPayload): Promise<{ status: string; message: string }> => {
    const { data } = await api.post("lawyer/verification", payload);

    return data;
  },
};
