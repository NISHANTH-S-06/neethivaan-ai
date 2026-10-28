"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

import { FilterBar } from "@/components/complaint/FilterBar"
import { CaseCard } from "@/components/complaint/CaseCard"
import { complaintsService } from "@/lib/services/complaints"
import { CaseStatus } from "@/components/complaint/StatusBadge"

export default function CaseListPage() {
  const [cases, setCases] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchCases = async () => {
    try {
      setLoading(true)
      const data = await complaintsService.getMyComplaints()
      // Map backend schema to UI schema
      const mapped = data.map((c: any) => ({
         id: c.case_id,
         title: c.title,
         status: (c.status || "Submitted") as CaseStatus,
         priority: "Medium", // Backend schema lacks explicit priority right now
         date: new Date(c.created_at || Date.now()).toLocaleDateString(),
         category: c.issue_type || "Uncategorized"
      }))
      setCases(mapped)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load cases")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCases()
  }, [])

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header section with CTAs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-stitch-gold"
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest font-manrope">The Architectural Jurist</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold font-manrope tracking-tight text-white"
            >
              Active Workspace
            </motion.h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Manage your ongoing complaints, cases, and legal disputes.
            </p>
          </div>
          
          <Link 
            href="/user/complaints/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-stitch-gold to-[#c5a059] text-stitch-deep-blue rounded-xl font-bold hover:shadow-[0_0_20px_rgba(233,193,118,0.2)] transition-all shrink-0 hover:-translate-y-0.5"
          >
             <Plus className="h-5 w-5" /> New Filing
          </Link>
        </div>

        {/* Global Toolbar */}
        <div className="border-t border-b border-white/5 py-6">
          <FilterBar />
        </div>

        {/* Case List Array */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
               <RefreshCw className="h-8 w-8 animate-spin mb-4 text-stitch-gold" />
               <p>Connecting to secure ledger...</p>
             </div>
          ) : error ? (
             <div className="text-center py-10 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 font-bold">
               {error}
             </div>
          ) : cases.length === 0 ? (
             <div className="text-center py-20 text-muted-foreground border border-white/5 border-dashed rounded-xl">
               No active cases found.
             </div>
          ) : (
            cases.map((caseItem, i) => (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <CaseCard {...caseItem} />
              </motion.div>
            ))
          )}
        </motion.div>

      </div>
    </div>
  )
}
