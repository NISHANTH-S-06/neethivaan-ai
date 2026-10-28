"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Download, UserCircle, Scale, RefreshCw } from "lucide-react"
import Link from "next/link"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { StatusBadge, CaseStatus } from "@/components/complaint/StatusBadge"
import { Timeline } from "@/components/complaint/Timeline"
import { AIInsightPanel } from "@/components/complaint/AIInsightPanel"
import { ReviewPanel } from "@/components/admin/ReviewPanel"
import { complaintsService } from "@/lib/services/complaints"
import { adminService } from "@/lib/services/admin"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminCaseReviewPage({ params }: PageProps) {
  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)
  const [updating, setUpdating] = React.useState(false)

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

  const handleAction = async (newStatus: string) => {
     try {
        setUpdating(true)
        await adminService.updateComplaintStatus(id, newStatus)
        // Refresh local data optimistically
        setData((prev: any) => ({ ...prev, status: newStatus }))
     } catch (err: any) {
        alert("Failed to execute administrative action")
     } finally {
        setUpdating(false)
     }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stitch-deep-blue flex flex-col items-center justify-center text-stitch-gold">
        <RefreshCw className="h-10 w-10 animate-spin mb-4" />
        <p className="font-manrope font-bold tracking-widest text-sm uppercase">Loading Case Intelligence...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stitch-deep-blue flex flex-col items-center justify-center p-6 text-center text-destructive">
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl">
           <h2 className="text-xl font-bold mb-2">Access Denied</h2>
           <p>{error}</p>
           <Link href="/admin/cases" className="mt-4 block text-sm underline text-white">Return to Global Queue</Link>
        </div>
      </div>
    )
  }

  // Timeline is fetched directly from backend metadata payload to prevent mock traces

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link 
            href="/admin/cases"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Global Queue
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stitch-gold px-3 py-1 bg-stitch-gold/10 rounded-lg uppercase tracking-widest">{data.case_id}</span>
                <StatusBadge status={(data.status || "Submitted") as CaseStatus} />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-manrope text-white tracking-tight">
                {data.title || "Untitled File"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4 bg-stitch-surface-container-low px-4 py-2 border border-white/5 rounded-xl">
               <UserCircle className="h-8 w-8 text-muted-foreground" />
               <div className="text-sm">
                 <p className="font-bold text-white">Filed by Node ID:</p>
                 <p className="text-muted-foreground tracking-wide font-medium">{data.user_id}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Case Details Section */}
          <div className="lg:col-span-2 space-y-8">
             <GlassPanel className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Statement of Facts</h3>
                  <p className="text-base text-foreground/90 leading-relaxed bg-stitch-surface-container-lowest p-6 rounded-xl border border-white/5 whitespace-pre-wrap">
                    {data.description || "No specific statement of facts logged."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Requested Category</p>
                    <p className="text-sm font-medium text-white px-4 py-2 bg-stitch-surface-container-low rounded-xl inline-flex">
                      {data.issue_type || "General Query"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Priority</p>
                    <p className="text-sm font-medium text-destructive px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-xl inline-flex font-bold">
                      Standard Evaluation
                    </p>
                  </div>
                </div>

             </GlassPanel>

             <GlassPanel intensity="low" className="p-6">
                <h3 className="text-lg font-bold font-manrope text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-stitch-gold"/> System Activity Timeline
                </h3>
                <Timeline 
                  currentStatus={(data.status || "Submitted") as CaseStatus} 
                  events={data.timeline || []} 
                />
             </GlassPanel>
          </div>

          {/* Right Sidebar (Admin Actions & Intel) */}
          <div className="space-y-8">
            <div className={`transition-opacity ${updating ? 'opacity-50 pointer-events-none' : ''}`}>
                <ReviewPanel 
                  onAccept={() => handleAction("ACCEPTED")}
                  onReject={() => handleAction("REJECTED")}
                  onReassign={() => console.log("Routing Reassignment Logic...")}
                  isUrgent={false}
                />
            </div>
            
            {(data.ai_context || data.ai_answer) && (
                <AIInsightPanel 
                  category="Automated Triage Analysis"
                  riskLevel="Medium"
                  keyPoints={[
                    data.ai_answer || "Legal LLM scan completed.",
                    "No immediate flags detected. Routine administration advised."
                  ]}
                />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
