"use client"

import * as React from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { FileText, Search, Filter, Loader2, ChevronRight, Download, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AdminComplaints() {
  const [complaints, setComplaints] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await apiClient.get("/complaints/")
        setComplaints(response.data.reverse()) // Show newest first
        setLoading(false)
      } catch (err: any) {
        console.error("Failed to fetch complaints:", err)
        setError("Network response error: " + (err.response?.data?.detail || err.message))
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  const filteredComplaints = complaints.filter(c => 
    c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dark-blue dark:text-gold" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark-blue dark:text-gold tracking-tight">Complaint Management</h1>
          <p className="text-muted-foreground text-sm">Review, analyze, and assign legal cases.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="flex-1 md:flex-none bg-dark-blue dark:bg-gold text-white dark:text-dark-blue font-bold">
            Generate Report
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center mb-6">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID, Title, or Name..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                <tr className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Case ID</th>
                  <th className="px-6 py-4">Complainant</th>
                  <th className="px-6 py-4">Issue Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      No complaints match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <tr key={c.case_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/admin/complaints/${c.case_id}`} className="font-mono font-bold text-blue-600 dark:text-gold hover:underline">
                          {c.case_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{c.complainant_name || "N/A"}</div>
                        <div className="text-[10px] text-muted-foreground">{c.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge variant="outline" className="text-[10px] uppercase font-bold">{c.issue_type || "General"}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          c.status === "SUBMITTED" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          c.status === "ANALYZING" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500" :
                          c.status === "PROCESSED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500" : ""
                        }>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" asChild className="group-hover:translate-x-1 transition-transform">
                          <Link href={`/admin/complaints/${c.case_id}`} className="flex items-center gap-1.5 font-bold text-xs uppercase text-dark-blue dark:text-gold">
                             View <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
