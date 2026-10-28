"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Scale, FolderOpen, AlertCircle, RefreshCw, ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { lawyerService, type LawyerCase } from "@/lib/services/lawyer"

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  ESCALATED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

export default function LawyerCasesPage() {
  const [cases, setCases] = React.useState<LawyerCase[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState("ALL")
  const [updating, setUpdating] = React.useState<string | null>(null)

  const fetchCases = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await lawyerService.getAssignedCases()
      setCases(data)
    } catch {
      setError("Failed to load cases. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchCases() }, [fetchCases])

  const handleStatusUpdate = async (caseId: string, status: string) => {
    setUpdating(caseId)
    try {
      await lawyerService.updateCaseStatus(caseId, status)
      setCases(prev => prev.map(c => c.case_id === caseId ? { ...c, status } : c))
    } catch {
      setError("Failed to update status.")
    } finally {
      setUpdating(null)
    }
  }

  const filtered = cases.filter(c => {
    const matchesSearch = !search || 
      c.case_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark-blue dark:text-gold tracking-tight">Case Management</h1>
          <p className="text-muted-foreground mt-1">All cases assigned to you from Mission Control.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCases} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by case ID, client, or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(val) => { if (val) setFilterStatus(val) }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {["ASSIGNED", "UNDER_REVIEW", "RESOLVED", "CLOSED", "ESCALATED"].map(s => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No cases match your filter criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.case_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="hover:shadow-md transition-all border-l-4 border-l-dark-blue dark:border-l-gold">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-sm font-bold font-mono">{c.case_id}</CardTitle>
                      <CardDescription className="mt-0.5">{c.complainant_name || "Unknown Client"} • {c.issue_type || "General"}</CardDescription>
                    </div>
                    <Badge className={`${STATUS_COLORS[c.status] || ""} border-0 text-xs`}>{c.status.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.title || "No title"}</p>
                  {c.created_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Filed: {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-2 border-t flex flex-wrap gap-2 items-center justify-between">
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link href={`/lawyer/workspace?case=${c.case_id}`}>
                      <Scale className="h-3 w-3 mr-1" /> Open Workspace <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                  <Select value={c.status} onValueChange={(val) => { if (val) handleStatusUpdate(c.case_id, val) }} disabled={updating === c.case_id}>
                    <SelectTrigger className="h-7 w-40 text-xs">
                      {updating === c.case_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
                    </SelectTrigger>
                    <SelectContent>
                      {["ASSIGNED", "UNDER_REVIEW", "RESOLVED", "CLOSED", "ESCALATED"].map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
