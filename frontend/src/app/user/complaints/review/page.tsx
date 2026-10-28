"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, FileText, AlertTriangle, Scale } from "lucide-react"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { AIInsightPanel } from "@/components/complaint/AIInsightPanel"

export default function ReviewComplaintPage() {
  const router = useRouter()

  const handleSubmit = () => {
    // In a real app, API submission goes here
    router.push("/user/complaints/success")
  }

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold font-manrope">Review Submission</h1>
            <p className="text-muted-foreground">Please verify the details below before finalizing your case filing.</p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-bold text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Summary Section */}
          <GlassPanel className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-bold font-manrope text-stitch-gold flex items-center gap-2 border-b border-white/5 pb-4">
              <FileText className="h-5 w-5" />
              Complaint Summary
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</p>
                <p className="text-lg text-white font-medium">Breach of Contract by Alpha Corp</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</p>
                <p className="text-sm text-foreground/80 leading-relaxed bg-stitch-surface-container-lowest p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                  On March 15th, 2026, Alpha Corp failed to deliver the agreed upon software architecture deliverables as stipulated in the contract signed on Jan 1st. Multiple attempts to contact their legal representatives have resulted in complete silence and disruption of our deployment pipeline.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                  <p className="text-sm font-medium text-white px-3 py-1.5 bg-stitch-surface-container-low rounded-lg inline-flex">
                    Civil Dispute
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</p>
                  <p className="text-sm font-medium text-white px-3 py-1.5 bg-stitch-surface-container-low rounded-lg inline-flex">
                    Medium
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attached Documents (2)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-stitch-surface-container-low rounded-xl border border-white/5">
                    <FileText className="h-5 w-5 text-stitch-gold" />
                    <span className="text-sm font-medium text-white truncate">Contract_Agreement_Alpha.pdf</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stitch-surface-container-low rounded-xl border border-white/5">
                    <FileText className="h-5 w-5 text-stitch-gold" />
                    <span className="text-sm font-medium text-white truncate">Email_Thread_Evidence.pdf</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* AI Insights Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <AIInsightPanel 
              category="Corporate Law - Breach of Contract"
              riskLevel="Medium"
              keyPoints={[
                "Clear mention of exact dates (March 15th, Jan 1st).",
                "Explicitly names respondent: Alpha Corp.",
                "Primary complaint revolves around non-delivery and lack of communication.",
                "Evidence attachments look complete for initial arbitration."
              ]}
            />
            
            <GlassPanel intensity="low" className="bg-primary/5 border-primary/20">
              <h4 className="text-sm font-bold font-manrope mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Legal Precedent Engine
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upon submission, this case will be immediately indexed against 5M+ contract dispute precedents to identify favorable outcomes for your representation.
              </p>
            </GlassPanel>
          </motion.div>
        </div>

        {/* Global Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-stitch-surface-container-highest/80 backdrop-blur-2xl border-t border-white/10 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <p className="hidden sm:block text-sm text-muted-foreground">
              By submitting, you agree to our <a href="#" className="underline hover:text-white">Terms of Legal Service</a>.
            </p>
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-stitch-gold to-[#c5a059] text-stitch-deep-blue rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(233,193,118,0.3)] transition-all hover:-translate-y-1"
            >
              Sign & Submit Filing <CheckCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Spacer for fixed footer */}
        <div className="h-24"></div>
      </div>
    </div>
  )
}
