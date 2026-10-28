"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Loader2, Send, Scale, ShieldCheck, FolderOpen, AlertCircle,
  RefreshCw, FileText, MessageSquare, CheckCircle, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { lawyerService, type LawyerCase, type LawyerProfile } from "@/lib/services/lawyer"

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  ESCALATED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

export default function LawyerDashboard() {
  const router = useRouter()
  const [question, setQuestion] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [aiAdvice, setAiAdvice] = React.useState<string | null>(null)
  const [cases, setCases] = React.useState<LawyerCase[]>([])
  const [profile, setProfile] = React.useState<LawyerProfile | null>(null)
  const [loadingCases, setLoadingCases] = React.useState(true)
  const [updatingCase, setUpdatingCase] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const stats = React.useMemo(() => {
    const assignedCount = cases.length;
    const pendingReviewCount = cases.filter(c => c.status === 'UNDER_REVIEW').length;
    const recentCases = cases.slice(0, 3);
    return { assignedCount, pendingReviewCount, recentCases };
  }, [cases]);

  const fetchData = React.useCallback(async () => {
    setLoadingCases(true)
    setError(null)
    try {
      const [casesData, profileData] = await Promise.all([
        lawyerService.getAssignedCases(),
        lawyerService.getLawyerProfile(),
      ])
      setCases(casesData)
      setProfile(profileData)
    } catch (err) {
      console.error("Failed to load lawyer data:", err)
      setError("Failed to load dashboard data. Is the backend running?")
    } finally {
      setLoadingCases(false)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role")
      if (role !== "lawyer" && role !== "admin") {
        router.push("/auth/login")
        return
      }
    }
    fetchData()
  }, [fetchData, router])

  const handleConsultAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setAiAdvice(null)
    try {
      const answer = await lawyerService.askAI(question)
      setAiAdvice(answer)
    } catch {
      setAiAdvice("Failed to retrieve legal advice. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    setUpdatingCase(caseId)
    try {
      await lawyerService.updateCaseStatus(caseId, newStatus)
      setCases(prev => prev.map(c => c.case_id === caseId ? { ...c, status: newStatus } : c))
    } catch {
      setError("Failed to update case status.")
    } finally {
      setUpdatingCase(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark-blue dark:text-gold tracking-tight">
            Advocate Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {loadingCases ? "Loading..." : (
              <span className="flex gap-4">
                <span>Assigned: <b className="text-foreground">{stats.assignedCount}</b></span>
                <span>Pending Review: <b className="text-amber-500">{stats.pendingReviewCount}</b></span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <Badge className="px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full font-bold text-sm flex items-center gap-2 border-0">
              <ShieldCheck className="h-4 w-4" /> {profile.full_name || "Verified Advocate"}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loadingCases}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingCases ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/lawyer/profile">My Profile</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Scale className="h-5 w-5 text-dark-blue dark:text-gold" />
              Active Assignments
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/lawyer/cases">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>

          {loadingCases ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cases.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No cases currently assigned to you.</p>
                <p className="text-sm text-muted-foreground mt-1">Check back or contact admin.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map((c, i) => (
                <motion.div
                  key={c.case_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all border-l-4 border-l-dark-blue dark:border-l-gold">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <CardTitle className="text-base font-bold font-manrope">{c.case_id}</CardTitle>
                        <Badge className={`${STATUS_COLORS[c.status] || ""} border-0 text-xs`}>
                          {c.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {c.issue_type && <span className="mr-2">[{c.issue_type}]</span>}
                        Client: {c.complainant_name || "—"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{c.title}</p>
                    </CardContent>
                    <CardFooter className="pt-2 border-t flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-xs" asChild>
                          <Link href={`/lawyer/workspace?case=${c.case_id}`}>
                            <FileText className="h-3 w-3 mr-1" /> Workspace
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" /> Chat
                        </Button>
                      </div>
                      <Select
                        value={c.status}
                        onValueChange={(val) => { if (val) handleStatusUpdate(c.case_id, val) }}
                        disabled={updatingCase === c.case_id}
                      >
                        <SelectTrigger className="h-7 w-36 text-xs">
                          <SelectValue />
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

        {/* AI Consultant */}
        <div className="lg:col-span-1">
          <Card className="border-2 shadow-lg h-full flex flex-col">
            <CardHeader className="bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-dark-blue dark:text-gold" />
                <CardTitle className="text-lg">Legal AI Consultant</CardTitle>
              </div>
              <CardDescription>Research laws and verify sections instantly</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4 space-y-4">
              <form onSubmit={handleConsultAI} className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Ask about IPC sections, precedents..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button type="submit" disabled={loading || !question.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-blue dark:text-gold hover:opacity-70 disabled:opacity-30">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
              {aiAdvice && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed text-sm leading-relaxed">
                  <p className="text-xs font-bold text-dark-blue dark:text-gold uppercase mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> AI Legal Advice
                  </p>
                  {aiAdvice}
                </div>
              )}
              {!aiAdvice && !loading && (
                <div className="flex flex-col items-center justify-center text-center opacity-40 py-8">
                  <Scale className="h-10 w-10 mb-2" />
                  <p className="text-xs">Cross-reference laws to assist case preparation.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t py-2">
              <p className="text-[10px] text-muted-foreground italic">AI results are for research assistance only.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
