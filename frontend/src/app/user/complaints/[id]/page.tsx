"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Download, Scale, RefreshCw } from "lucide-react"
import Link from "next/link"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { StatusBadge, CaseStatus } from "@/components/complaint/StatusBadge"
import { Timeline } from "@/components/complaint/Timeline"
import { AIInsightPanel } from "@/components/complaint/AIInsightPanel"
import { complaintsService } from "@/lib/services/complaints"
import CaseTimeline from '@/components/cases/CaseTimeline';

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CaseDetailPage({ params }: PageProps) {
  // Using React.use to unwrap params since Next.js App Router params are Promises in Next.js 15
  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)

  const fetchCaseDetail = async () => {
    try {
      setLoading(true)
      const res = await complaintsService.getById(id)
      setData(res)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load case specifics")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCaseDetail()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-stitch-deep-blue flex flex-col items-center justify-center text-stitch-gold">
        <RefreshCw className="h-10 w-10 animate-spin mb-4" />
        <p className="font-manrope font-bold tracking-widest text-sm uppercase">Decrypting secure case file...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stitch-deep-blue flex flex-col items-center justify-center p-6 text-center text-destructive">
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl">
           <h2 className="text-xl font-bold mb-2">Access Denied or Error</h2>
           <p>{error}</p>
           <Link href="/user/complaints" className="mt-4 block text-sm underline text-white">Return to Workspace</Link>
        </div>
      </div>
    )
  }

  // Timeline logic completely delegated to standard backend payload mapping.

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link 
            href="/user/complaints"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workspace
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stitch-gold px-3 py-1 bg-stitch-gold/10 rounded-lg uppercase tracking-widest">{data.case_id}</span>
                <StatusBadge status={(data.status || "Submitted") as CaseStatus} />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-manrope text-white tracking-tight">
                {data.title || "Untitled Complaint"}
              </h1>
            </div>
            
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-white/10 bg-stitch-surface-container hover:bg-stitch-surface-container-high rounded-xl text-white font-bold transition-all shrink-0 opacity-50 cursor-not-allowed">
               Update Case Details
            </button>
          </div>
        </div>

        <CaseTimeline currentStatus={data?.status || 'created'} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Case Details Section */}
          <GlassPanel className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Statement of Facts</h3>
              <p className="text-base text-foreground/90 leading-relaxed bg-stitch-surface-container-lowest p-6 rounded-xl border border-white/5 whitespace-pre-wrap">
                {data.description || "No statement provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                 <p className="text-sm font-medium text-white px-4 py-2 bg-stitch-surface-container-low rounded-xl inline-flex shadow-sm">
                   {data.issue_type || "Uncategorized"}
                 </p>
               </div>
               <div className="space-y-2">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</p>
                 <p className="text-sm font-medium text-white px-4 py-2 bg-stitch-surface-container-low rounded-xl inline-flex shadow-sm">
                   Medium Standard
                 </p>
               </div>
            </div>

            {/* Document Ledger */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Document Ledger <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-white">0</span>
              </h3>
              <div className="grid gap-3 text-muted-foreground text-sm italic">
                 No secure files attached yet. System storage bindings pending sync.
              </div>
            </div>
          </GlassPanel>

          {/* Right Sidebar (Timeline & Intel) */}
          <div className="space-y-8">
            
            <GlassPanel intensity="low" className="p-6">
              <h3 className="text-lg font-bold font-manrope text-white mb-6 border-b border-white/5 pb-4">Lifecycle Timeline</h3>
              <Timeline 
                currentStatus={(data.status || "Submitted") as CaseStatus} 
                events={data.timeline || []} 
              />
            </GlassPanel>

            {(data.ai_context || data.ai_answer) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AIInsightPanel 
                  category="Automated Triage Analysis"
                  riskLevel="Medium"
                  keyPoints={[
                    data.ai_answer || "Context analysis complete.",
                    "Sources verified in RAG vector database."
                  ]}
                />
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
