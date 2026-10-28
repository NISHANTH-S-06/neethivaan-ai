"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, ChevronLeft, Calendar, User, FileText, Activity } from "lucide-react"

interface CaseDetail {
  case_id: string
  title: string
  description: string
  issue_type: string
  complainant_name: string
  email: string
  phone: string
  location_text: string
  status: string
  created_at: string
  ai_context?: string
  ai_answer?: string
}

export default function CaseDetailView() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [complaint, setComplaint] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Status update states
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail()
    }
  }, [caseId])

  const fetchCaseDetail = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/complaints/${caseId}`)
      setComplaint(res.data)
      setSelectedStatus(res.data.status)
      setError(null)
    } catch (err: any) {
      console.error("Failed to fetch complaint detail:", err)
      setError(err.response?.data?.detail || "Failed to load case details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === complaint?.status) return

    try {
      setUpdating(true)
      setUpdateError(null)
      setUpdateSuccess(false)
      
      await apiClient.post(`/lawyer/cases/${caseId}/status`, {
        status: selectedStatus
      })
      
      setUpdateSuccess(true)
      // Refresh the data to reflect exact state in backend
      await fetchCaseDetail()
      
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (err: any) {
      console.error("Failed to update status:", err)
      setUpdateError(err.response?.data?.detail || "Failed to update status. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      case "CLOSED":
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      case "ESCALATED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "numeric", minute: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-dark-blue dark:text-gold animate-spin" />
        <p className="text-muted-foreground font-medium text-lg">Loading case details...</p>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold">Failed to load case</h2>
        <p className="text-muted-foreground max-w-md">{error || "Case details could not be found."}</p>
        <div className="flex items-center gap-4 mt-4">
          <Button variant="outline" onClick={() => router.push('/lawyer')} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Button onClick={fetchCaseDetail} className="bg-dark-blue text-white dark:bg-gold dark:text-dark-blue">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/lawyer')}
        className="flex items-center gap-2 mb-4 -ml-2 text-muted-foreground hover:text-dark-blue dark:hover:text-gold"
      >
        <ChevronLeft className="h-4 w-4" /> Back to assigned cases
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="outline" className="text-base font-mono bg-muted/50">
              {complaint.case_id}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {complaint.issue_type.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(complaint.status)}>
              {complaint.status.replace("_", " ")}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-dark-blue dark:text-gold">{complaint.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Calendar className="h-4 w-4" />
            <span>Reported on {formatDate(complaint.created_at)}</span>
          </div>
        </div>

        <Card className="w-full md:w-80 shrink-0 border-2 shadow-sm">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-dark-blue dark:text-gold" />
              Update Case Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Select New Status</label>
              <Select value={selectedStatus} onValueChange={(val) => { if (val) setSelectedStatus(val) }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSIGNED">Pending (Assigned)</SelectItem>
                  <SelectItem value="UNDER_REVIEW">In Progress (Reviewing)</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="ESCALATED">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {updateError && (
              <p className="text-xs text-red-500 font-medium">{updateError}</p>
            )}
            {updateSuccess && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                Status updated successfully!
              </p>
            )}

            <Button 
              className="w-full bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-semibold disabled:opacity-50"
              onClick={handleUpdateStatus}
              disabled={updating || selectedStatus === complaint.status}
            >
              {updating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                "Update Status"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap text-justify leading-relaxed">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {(complaint.ai_context || complaint.ai_answer) && (
            <Card className="shadow-sm border-blue-100 dark:border-blue-900">
              <CardHeader className="border-b border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Activity className="h-5 w-5" />
                  AI Legal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {complaint.ai_answer && (
                  <div>
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider">Automated Recommendation</h4>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{complaint.ai_answer}</p>
                  </div>
                )}
                
                {complaint.ai_context && complaint.ai_answer && <Separator className="bg-blue-100 dark:bg-blue-900/50" />}
                
                {complaint.ai_context && (
                  <div>
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider">Relevant Case Law / Context</h4>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground text-justify leading-relaxed">{complaint.ai_context}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Complainant Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Name</span>
                <p className="font-medium">{complaint.complainant_name}</p>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Contact</span>
                <p>{complaint.email || "No email provided"}</p>
                <p>{complaint.phone || "No phone provided"}</p>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Location</span>
                <p className="text-muted-foreground">{complaint.location_text}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
