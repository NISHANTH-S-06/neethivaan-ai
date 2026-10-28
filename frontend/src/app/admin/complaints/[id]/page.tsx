"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  MapPin, 
  FileText, 
  Scale, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Printer,
  Calendar,
  Phone,
  Mail,
  Fingerprint
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CaseDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [complaint, setComplaint] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [firLoading, setFirLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await apiClient.get(`/complaints/${id}`)
        setComplaint(res.data)
      } catch (err: any) {
        console.error("Failed to fetch case:", err)
        setError("Failed to fetch complaint details.")
      } finally {
        setLoading(false)
      }
    }
    fetchCase()
  }, [id])

  const handleGenerateFIR = async () => {
    setFirLoading(true)
    try {
      const res = await apiClient.post("/fir/generate", { case_id: id })
      setComplaint({ ...complaint, fir_text: res.data.fir_text })
      setError(null)
    } catch (err: any) {
      console.error("FIR Generation failed:", err)
      setError("Generating FIR failed: " + (err.response?.data?.detail || err.message))
    } finally {
      setFirLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dark-blue dark:text-gold" />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <Card className="p-12 border-2 border-dashed">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Case Not Found</h2>
          <p className="text-muted-foreground mt-2">The Case ID <strong>{id}</strong> could not be located in the central database.</p>
          <Button onClick={() => router.back()} className="mt-8 bg-dark-blue dark:bg-gold">Go Back</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black text-dark-blue dark:text-gold tracking-tight">{complaint.title}</h1>
             <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0">{complaint.status}</Badge>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">Case ID: {complaint.case_id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" /> Print Case
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export JSON
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Complaint & Meta */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
               <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                 <FileText className="h-4 w-4 text-dark-blue dark:text-gold" />
                 Complaint Description
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <p className="text-sm leading-relaxed whitespace-pre-wrap text-justify italic italic-muted">
                 "{complaint.description}"
               </p>
               
               <Separator className="my-6" />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <div className="flex items-start gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><User className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Complainant</p>
                        <p className="text-sm font-semibold">{complaint.complainant_name || "N/A"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Phone className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone</p>
                        <p className="text-sm">{complaint.phone || "Not provided"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Mail className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Email</p>
                        <p className="text-sm">{complaint.email || "No email"}</p>
                      </div>
                   </div>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="flex items-start gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><MapPin className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Location</p>
                        <p className="text-sm leading-snug">{complaint.location_text || "N/A"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Calendar className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Submitted On</p>
                        <p className="text-sm">{new Date(complaint.created_at).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Fingerprint className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Identity Verified</p>
                        <Badge variant="outline" className="text-[10px] h-5 mt-0.5">{complaint.id_type || "No ID"}</Badge>
                      </div>
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* AI Legal Analysis Section */}
          <div className="space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-dark-blue dark:text-gold" />
                AI Legal Intelligence
             </h2>
             
             <Card className="border-l-4 border-l-blue-600 bg-blue-50/20 dark:bg-blue-900/10">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <ShieldCheck className="h-4 w-4" /> RAG Context: Relevant Statutes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">
                  {complaint.ai_context || "AI was unable to retrieve specific legal context for this query."}
                </CardContent>
             </Card>

             <Card className="border-l-4 border-l-gold bg-amber-50/20 dark:bg-amber-900/10">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-dark-blue dark:text-gold">
                    <AlertCircle className="h-4 w-4" /> AI Generated Legal Answer
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                   {complaint.ai_answer || "Legal summary pending final processing."}
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Right Column: FIR & Actions */}
        <div className="lg:col-span-1 space-y-8">
           <Card className="border-2 shadow-lg h-full flex flex-col overflow-hidden">
              <CardHeader className="bg-slate-900 text-white dark:bg-slate-900 border-b">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gold" /> Official FIR Record
                 </CardTitle>
                 <CardDescription className="text-slate-400">Section-wise Legal Breakdown</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-6 overflow-y-auto max-h-[600px]">
                 {complaint.fir_text ? (
                   <div className="bg-white dark:bg-slate-800 p-6 rounded border-2 border-dashed font-serif text-xs leading-loose whitespace-pre-wrap shadow-inner">
                      {complaint.fir_text}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
                      <Scale className="h-12 w-12" />
                      <p className="text-sm font-medium">No formal FIR generated for this case ID.</p>
                      <Button 
                        onClick={handleGenerateFIR} 
                        disabled={firLoading}
                        className="bg-dark-blue dark:bg-gold text-white dark:text-dark-blue font-bold px-8"
                      >
                        {firLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Generate Official FIR
                      </Button>
                   </div>
                 )}
              </CardContent>
              {complaint.fir_text && (
                <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t py-4">
                   <Button variant="outline" className="w-full gap-2 text-xs font-bold font-mono">
                      <Download className="h-3 w-3" /> DOWNLOAD AS PDF (SECURED)
                   </Button>
                </CardFooter>
              )}
           </Card>
        </div>
      </div>
    </div>
  )
}
