"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { AlertCircle } from "lucide-react";

export default function AnalysisPage() {
  const params = useParams();
  const caseId = params.case_id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    if (!caseId) return;
    const fetchAnalysis = async () => {
      try {
         const res = await apiClient.get(`/complaints/${caseId}`);
         setCaseData(res.data);
      } catch (err: any) {
         setError("Failed to load analysis: " + (err.response?.data?.detail || err.message));
      } finally {
         setLoading(false);
      }
    };
    fetchAnalysis();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-8 text-2xl font-bold animate-pulse text-dark-blue dark:text-gold">AI is analyzing your complaint...</h2>
        <p className="mt-2 text-gray-500">Retrieving IPC sections and scanning legal knowledge base.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark-blue dark:text-gold">Analysis: {caseId}</h1>
        <span className="px-4 py-1 bg-red-100 text-red-800 font-bold rounded-full border border-red-300">Urgency: HIGH</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-3" /> {error}
        </div>
      )}

      {caseData && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold border-b pb-2">Identified Legal Suggestions</h2>
            
            <div className="p-6 bg-white dark:bg-gray-900 border border-gold rounded-xl shadow-md">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Generated AI Legal Answer</h3>
              </div>
              <p className="mt-4 text-sm font-semibold bg-gray-100 dark:bg-gray-800 p-4 rounded whitespace-pre-wrap">
                {caseData.ai_answer || "No legal answer generated yet for this complaint."}
              </p>
              
              <div className="mt-6">
                <h4 className="text-sm font-bold uppercase text-muted-foreground mb-2 shadow-sm">Legal Context References</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {caseData.ai_context || "No references available."}
                </p>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Confidence: HIGH</span>
                <a href={`/admin/complaints/${caseId}`} className="text-blue-500 hover:underline">View Source Document</a>
              </div>
            </div>
          </div>

        <div className="space-y-6">
          <div className="p-6 bg-dark-blue text-white rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gold mb-2">Proceed to Final Report</h3>
            <p className="text-sm text-gray-300 mb-6">Select the legal assertions you agree with to generate your final Actionable Report PDF.</p>
            <button className="w-full py-3 bg-gold text-dark-blue font-bold rounded-lg hover:bg-yellow-500 transition shadow-lg">
              Generate Final Report
            </button>
          </div>

          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Risk Flags</h3>
            <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300 space-y-2">
              <li>Limitation period for Section 420 may apply based on the incident date.</li>
              <li>Insufficient bank statement attachment to prove the transfer.</li>
            </ul>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
