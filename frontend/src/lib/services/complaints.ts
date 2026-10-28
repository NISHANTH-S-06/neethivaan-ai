import { api } from "@/lib/api";


export interface ComplaintCreateDTO {
  title?: string;
  description?: string;
  text?: string;
  issue_type?: string;
  category?: string;
}

export const complaintsService = {
  async create(data: ComplaintCreateDTO) {
    // The fastAPI expects 'issue_type' but the UI might send 'category'. Mapping them here.
    const payload = {
        ...data,
        issue_type: data.issue_type || data.category
    };
    const res = await api.post("complaints/", payload);

    return res.data;

  },

  async getMyComplaints() {
    const res = await api.get("complaints/my");

    return res.data;

  },

  async getById(caseId: string) {
    const res = await api.get(`complaints/${caseId}`);

    return res.data;

  },
  
  async getStatusById(caseId: string) {
    const res = await api.get(`/complaints/${caseId}/status`);
    return res.data;

  },

  async uploadFile(caseId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`complaints/${caseId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }
};
