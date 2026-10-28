import { api } from "@/lib/api";


export interface AIInsight {
  category: string;
  risk_level: "low" | "medium" | "high" | "critical";
  key_points: string[];
  recommended_sections: string[];
  summary: string;
}

export const aiService = {
  analyzeComplaint: async (text: string): Promise<AIInsight> => {
    const { data } = await api.post("complaints/", {

      text,
      title: "AI Analysis Request",
      description: text,
    });
    // Parse the AI answer from the backend RAG response
    return {
      category: data.ai_context?.split("\n")[0] || "General Legal Matter",
      risk_level: "medium",
      key_points: data.ai_answer
        ? data.ai_answer.split(". ").filter(Boolean).slice(0, 4)
        : ["AI analysis pending"],
      recommended_sections: [],
      summary: data.ai_answer || "Analysis in progress.",
    };
  },

  getComplaintInsights: async (caseId: string): Promise<{ ai_context: string; ai_answer: string }> => {
    const { data } = await api.get(`complaints/${caseId}`);

    return {
      ai_context: data.ai_context || "",
      ai_answer: data.ai_answer || "",
    };
  },

  askLawyerAI: async (question: string): Promise<string> => {
    const { data } = await api.post("lawyer/ask", { question });

    return data.answer;
  },
};
