"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, RefreshCw, Loader2, AlertCircle, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { DataTable, ColumnDef } from "@/components/admin/DataTable"
import { adminService, type AuditLogEntry } from "@/lib/services/admin"

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  lawyer: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  user: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
}

const columns: ColumnDef<AuditLogEntry>[] = [
  { key: "timestamp", header: "Timestamp" },
  { key: "actor_name", header: "Actor" },
  { key: "actor_role", header: "Role" },
  { key: "action", header: "Action" },
  { key: "target_id", header: "Target ID", align: "right" },
]

export default function AdminAuditPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getAuditLogs()
      setLogs(data)
    } catch {
      setError("Could not load audit logs. Backend may not have this endpoint yet.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = logs.filter(l => 
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actor_name.toLowerCase().includes(search.toLowerCase()) ||
    l.target_id.toLowerCase().includes(search.toLowerCase())
  )

  // Format timestamps for readability
  const displayLogs = filtered.map(l => ({
    ...l,
    timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "—",
  }))

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-gold">
              <Shield className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Mission Control</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl font-bold font-manrope text-white"
            >
              Audit Logs
            </motion.h1>
            <p className="text-muted-foreground">Complete immutable record of all platform actions for compliance.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="shrink-0">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by action, actor, or case ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-3 border border-yellow-200">
            <AlertCircle className="h-4 w-4" />
            {error}
            <span className="text-xs ml-2 text-muted-foreground">(This feature requires /api/admin/audit-logs backend endpoint)</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayLogs.length === 0 && !error ? (
          <GlassPanel>
            <div className="flex flex-col items-center py-16 text-center gap-4">
              <Clock className="h-12 w-12 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No audit logs found matching your filters.</p>
              {search && <Button variant="ghost" size="sm" onClick={() => setSearch("")}>Clear filter</Button>}
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-manrope text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" /> Activity Ledger
              </h3>
              <Badge className="text-xs bg-white/10 text-white border-0">{displayLogs.length} entries</Badge>
            </div>
            <DataTable
              columns={columns}
              data={displayLogs.map(l => ({
                ...l,
                actor_role: l.actor_role, // Will render as text; enhance with color badge if needed
              }))}
              keyExtractor={(item) => item.id}
            />
          </GlassPanel>
        )}
      </div>
    </div>
  )
}
