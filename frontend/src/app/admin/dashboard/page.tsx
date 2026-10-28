"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, FolderOpen, Scale, Users, FileText, Loader2, AlertTriangle, BarChart3 } from "lucide-react"
import dynamic from "next/dynamic"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { AdminStatsCard } from "@/components/admin/AdminStatsCard"
import { DataTable, ColumnDef } from "@/components/admin/DataTable"
import { adminService, type AdminStats } from "@/lib/services/admin"

const Heatmap = dynamic(() => import("@/components/admin/Heatmap"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center text-gold/30 font-bold tracking-widest">INITIALIZING GEOSPATIAL ENGINE...</div>
})

type RecentActivityRow = { id: string; action: string; target: string; user: string; time: string }

const recentActivityColumns: ColumnDef<RecentActivityRow>[] = [
  { key: "action", header: "Action Taken" },
  { key: "target", header: "Target Identifier" },
  { key: "user", header: "Actor" },
  { key: "time", header: "Timestamp", align: "right" },
]

function timeAgo(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.max(0, Math.floor(diff / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  const days = Math.floor(hrs / 24)
  return `${days} days ago`
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null)
  const [coords, setCoords] = React.useState<any[]>([])
  const [recentActivity, setRecentActivity] = React.useState<RecentActivityRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [s, c, logs] = await Promise.all([
          adminService.getStats(),
          adminService.getComplaintCoordinates(),
          adminService.getAuditLogs(1, 10),
        ])
        setStats(s)
        setCoords(c)
        setRecentActivity(
          (logs || []).slice(0, 3).map((l: any) => ({
            id: l.id,
            action: l.action || "ACTION",
            target: l.target_id || l.target_type || "",
            user: l.actor_name || l.actor_role || l.actor_id || "System",
            time: timeAgo(l.timestamp),
          }))
        )
      } catch (error) {
        console.error("Dashboard data load failed:", error)
        setError((error as any)?.message || "Failed to load admin dashboard")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex min-h-screen bg-stitch-deep-blue items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-stitch-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-white font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {error && (
          <div className="text-center py-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 font-bold">
            {error}
          </div>
        )}
        
        {/* Header section with CTAs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-stitch-gold"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="text-sm font-bold uppercase tracking-widest font-manrope text-stitch-gold/80">Command & Control Center</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold font-manrope tracking-tight text-white mb-2"
            >
              Mission <span className="text-stitch-gold">Overview</span>
            </motion.h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Real-time geospatial analytics, workload balancing, and AI system health monitoring.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 px-4 py-2 rounded-lg border border-green-500/30 shadow-inner">
             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             Nodes Synchronized
          </div>
        </div>

        {/* Global Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
           <AdminStatsCard 
             title="Total Complaints" 
             value={stats.total_complaints.toString()} 
             change="+12%" 
             trend="up" 
             icon={FileText} 
             colorTheme="primary"
           />
           <AdminStatsCard 
             title="Pending Review" 
             value={stats.pending_complaints.toString()} 
             change="Critical" 
             trend="neutral" 
             icon={AlertTriangle} 
             colorTheme="destructive"
           />
           <AdminStatsCard 
             title="Total Users" 
             value={stats.total_users.toString()} 
             change="Verified" 
             trend="up" 
             icon={Users} 
             colorTheme="success"
           />
           <AdminStatsCard 
             title="Active Lawyers" 
             value={stats.total_lawyers.toString()} 
             change="On Shift" 
             trend="neutral" 
             icon={Users} 
             colorTheme="secondary"
           />
        </motion.div>

        {/* Density Map & Health Monitor */}
        <div className="grid lg:grid-cols-3 gap-8">
            <GlassPanel className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold font-manrope text-white flex items-center gap-2">
                    <Scale className="h-5 w-5 text-stitch-gold"/> Geospatial Density
                </h3>
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Complaint Hotspots</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/5">
                <Heatmap data={coords} />
              </div>
            </GlassPanel>

            <GlassPanel intensity="low" className="border-t-4 border-t-stitch-gold flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-manrope text-white mb-6">Network Health</h3>
                <div className="space-y-6">
                    {[
                    { label: "RAG Pipeline", percent: 98, color: "bg-primary" },
                    { label: "Ollama (LLM)", percent: 94, color: "bg-stitch-gold" },
                    { label: "Postgres DB", percent: 100, color: "bg-emerald-500" },
                    { label: "Redis Cache", percent: 88, color: "bg-white/20" },
                    ].map((stat) => (
                    <div key={stat.label} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <span>{stat.label}</span>
                            <span className="text-white">{stat.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full ${stat.color} rounded-full`}
                            />
                        </div>
                    </div>
                    ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="p-4 bg-stitch-gold/5 rounded-xl border border-stitch-gold/10">
                    <p className="text-[10px] text-stitch-gold/60 font-black uppercase tracking-widest mb-2">Security Note</p>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">All administrative actions are logged and encrypted at the node level (NV-772).</p>
                </div>
              </div>
            </GlassPanel>
        </div>

        {/* Global Activity Ledger */}
        <GlassPanel>
            <h3 className="text-xl font-bold font-manrope text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <ShieldAlert className="h-5 w-5 text-stitch-gold"/> Operations Ledger
            </h3>
            <DataTable 
            columns={recentActivityColumns} 
            data={recentActivity} 
            keyExtractor={(item) => item.id}
            />
        </GlassPanel>

      </div>
    </div>
  )
}
