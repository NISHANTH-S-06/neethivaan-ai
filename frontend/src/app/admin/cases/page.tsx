"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Plus, FileStack, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { ActionToolbar } from "@/components/admin/ActionToolbar"
import { DataTable, ColumnDef } from "@/components/admin/DataTable"
import { StatusBadge, CaseStatus } from "@/components/complaint/StatusBadge"
import { adminService } from "@/lib/services/admin"

export default function AdminCaseQueuePage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [cases, setCases] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllComplaints()
      
      const mapped = data.map((c: any) => ({
         id: c.case_id,
         title: c.title,
         status: (c.status || "Submitted") as CaseStatus,
         priority: "Medium", 
         counsel: c.user_id ? "Assigned" : "Unassigned", // Placeholder logic
         date: new Date(c.created_at || Date.now()).toLocaleDateString(),
      }))
      setCases(mapped)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load global queue")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchQueue()
  }, [])

  const filteredQueue = React.useMemo(() => {
    return cases.filter(c => 
      c.id.toLowerCase().includes(search.toLowerCase()) || 
      (c.title && c.title.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, cases])

  const columns: ColumnDef<any>[] = [
    { key: "id", header: "Case ID" },
    { 
      key: "title", 
      header: "Title",
      render: (item) => <span className="font-bold text-white max-w-[200px] truncate block">{item.title || "Untitled"}</span>
    },
    { 
      key: "status", 
      header: "Status",
      render: (item) => <StatusBadge status={item.status} showIcon={false} />
    },
    { 
      key: "priority", 
      header: "Priority",
      render: (item) => {
        const isHigh = item.priority === "High" || item.priority === "Critical"
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isHigh ? 'bg-destructive/10 text-destructive' : 'bg-white/5 text-muted-foreground'}`}>
            {item.priority}
          </span>
        )
      }
    },
    { key: "counsel", header: "Assigned Counsel" },
    { key: "date", header: "Init Date", align: "right" },
  ]

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-stitch-gold"
            >
              <FileStack className="h-6 w-6" />
              <span className="text-sm font-bold uppercase tracking-widest font-manrope">Global Registry</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold font-manrope tracking-tight text-white mb-2"
            >
              Complaint Queue
            </motion.h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Triage, assign, and manage citizen complaints across all network nodes.
            </p>
          </div>
        </div>

        {/* Global Toolbar + Table Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel className="p-0 border border-white/5 shadow-2xl">
            <ActionToolbar 
              onSearch={setSearch}
              onFilterToggle={() => console.log('Filters Toggled')}
              searchPlaceholder="Search case id or title..."
            />
            
            <div className="p-2 sm:p-6 min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mb-4 text-stitch-gold" />
                  <p>Processing centralized ledger...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 font-bold m-4">
                  {error}
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={filteredQueue} 
                  keyExtractor={(item) => item.id}
                  onRowClick={(item) => router.push(`/admin/cases/${item.id}`)}
                />
              )}
            </div>
          </GlassPanel>
        </motion.div>

      </div>
    </div>
  )
}
