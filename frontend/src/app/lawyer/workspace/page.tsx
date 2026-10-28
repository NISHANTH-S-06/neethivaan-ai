"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Loader2, Scale, AlertCircle, FileText, Save,
  UploadCloud, CheckCircle, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { lawyerService, type LawyerCase } from "@/lib/services/lawyer"
import { aiService } from "@/lib/services/ai"

function WorkspaceContent() {
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case")

  const [caseData, setCaseData] = React.useState<LawyerCase | null>(null)
  const [note, setNote] = React.useState("")
  const [aiInsight, setAiInsight] = React.useState<{ ai_context: string; ai_answer: string } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [savingNote, setSavingNote] = React.useState(false)
  const [uploadingFile, setUploadingFile] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!caseId) { setLoading(false); return }
    const load = async () => {
      setLoading(true)
      try {
        const [casesData, insights] = await Promise.all([
          lawyerService.getAssignedCases(),
          aiService.getComplaintInsights(caseId),
        ])
        const found = casesData.find(c => c.case_id === caseId) || null
        setCaseData(found)
        setAiInsight(insights)
      } catch {
        setError("Could not load case details. Check backend connection.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [caseId])

  const handleSaveNote = async () => {
    if (!caseId || !note.trim()) return
    setSavingNote(true)
    try {
      await lawyerService.addCaseNote(caseId, note)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setError("Failed to save note.")
    } finally {
      setSavingNote(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !caseId) return
    setUploadingFile(true)
    try {
      const { upload_url } = await lawyerService.getDocumentUploadUrl(caseId, file.name)
      await fetch(upload_url, { method: "PUT", body: file })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setError("File upload failed.")
    } finally {
      setUploadingFile(false)
    }
  }

  if (!caseId) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <Scale className="h-16 w-16 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold">No Case Selected</h2>
        <p className="text-muted-foreground">Navigate here from a case in the Cases tab.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Lawyer Workspace</p>
          <h1 className="text-2xl font-extrabold text-dark-blue dark:text-white font-manrope">{caseId}</h1>
          {caseData && (
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {caseData.status.replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">{caseData.issue_type}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {saveSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3 border border-green-200">
          <CheckCircle className="h-4 w-4" /> Saved successfully.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Case Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Case Details
              </CardTitle>
              {caseData && <CardDescription>Client: {caseData.complainant_name}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {caseData ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Title</p>
                    <p>{caseData.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                    <p className="text-muted-foreground leading-relaxed">{caseData.description || "—"}</p>
                  </div>
                  {caseData.created_at && (
                    <p className="text-xs text-muted-foreground">Filed: {new Date(caseData.created_at).toLocaleString("en-IN")}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Case not found in your assignments.</p>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border-t-4 border-t-gold">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4 text-gold" /> AI Analysis
              </CardTitle>
              <CardDescription>RAG-powered insights on this complaint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {aiInsight?.ai_answer ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">AI Answer</p>
                    <p className="text-muted-foreground leading-relaxed">{aiInsight.ai_answer}</p>
                  </div>
                  {aiInsight.ai_context && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Legal Context</p>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-6">{aiInsight.ai_context}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-8 text-center opacity-40">
                  <Scale className="h-10 w-10 mb-2" />
                  <p className="text-xs">AI analysis pending or unavailable for this case.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lawyer Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Lawyer Notes</CardTitle>
              <CardDescription>Add research notes, observations, or annotations for this case.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your case notes, legal findings, or observations..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveNote} disabled={savingNote || !note.trim()} className="bg-dark-blue text-white hover:bg-dark-blue/90">
                  {savingNote ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Note
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingFile}>
                  {uploadingFile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                  Upload Document
                </Button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                <Button variant="ghost" size="sm" asChild className="ml-auto">
                  <a href={`/user/complaints/${caseId}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> View Full Case
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function LawyerWorkspacePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><span className="animate-spin">⚖️</span></div>}>
      <WorkspaceContent />
    </Suspense>
  )
}
