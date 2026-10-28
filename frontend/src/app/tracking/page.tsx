"use client"

import * as React from "react"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Search, Loader2, AlertCircle, Clock, CheckCircle2, FileText, MapPin, Scale, ShieldCheck, Download } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";

export default function TrackingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [caseId, setCaseId] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [complaint, setComplaint] = React.useState<any>(null)
  const [error, setError] = React.useState("")
  const [firLoading, setFirLoading] = React.useState(false)
  const [role, setRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role")
    if (!token) {
      alert(t("track_login_alert"))
      router.push("/auth/login")
    }
    setRole(storedRole)
  }, [router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseId.trim()) return

    setLoading(true)
    setError("")
    setComplaint(null)

    try {
      const response = await apiClient.get(`/complaints/${caseId.trim()}`)
      setComplaint(response.data)
    } catch (err: any) {
      setError(err.response?.status === 404 ? t("track_error_not_found") : t("track_error_generic"))
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFIR = async () => {
    setFirLoading(true)
    try {
      const res = await apiClient.post("/fir/generate", { case_id: complaint.case_id })
      setComplaint({ ...complaint, fir_text: res.data.fir_text })
    } catch (e) {
      console.error("FIR Gen failed", e)
    } finally {
      setFirLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-dark-blue dark:text-gold tracking-tight">{t("track_title")}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">{t("track_subtitle")}</p>
      </div>

      <Card className="shadow-lg border-2">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder={t("track_placeholder")} 
                className="pl-10 h-14 text-lg font-mono tracking-wider" 
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="h-14 px-8 bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-bold text-lg">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("track_button")}
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm mt-4 flex items-center gap-2 font-medium animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} /> {error}
          </p>}
        </CardContent>
      </Card>

      {complaint && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Status Card */}
            <Card className="md:col-span-2 border-l-4 border-l-dark-blue dark:border-l-gold">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="font-mono text-[10px] tracking-widest uppercase">{complaint.case_id}</Badge>
                  <div className="flex items-center gap-2 text-dark-blue dark:text-gold font-bold">
                    <Clock size={16} className="animate-pulse" />
                    <span>{complaint.status}</span>
                  </div>
                </div>
                <CardTitle className="text-2xl mt-2">{complaint.title || "Case Detail Overview"}</CardTitle>
                <CardDescription>Filed on {new Date(complaint.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("track_original_desc")}</p>
                  <p className="text-sm leading-relaxed border-l-2 pl-4 italic opacity-80">{complaint.description}</p>
                </div>
                
                <Separator />

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><MapPin className="h-4 w-4" /></div>
                      <div className="text-xs">
                         <p className="font-bold">{t("track_location")}</p>
                         <p className="text-muted-foreground">{complaint.location_text || t("track_na")}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><FileText className="h-4 w-4" /></div>
                      <div className="text-xs">
                         <p className="font-bold">{t("track_type")}</p>
                         <p className="text-muted-foreground">{complaint.issue_type || t("track_general")}</p>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Stats */}
            <Card className="bg-slate-900 text-white dark:bg-slate-900">
               <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-gold" /> {t("dash_system_integrity")}
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-xs">
                     <span className="opacity-70">{t("dash_ai_classification")}</span>
                     <Badge variant="outline" className="text-[10px] text-gold border-gold">{t("badge_complete")}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="opacity-70">{t("dash_rag_verification")}</span>
                     <Badge variant="outline" className="text-[10px] text-green-400 border-green-400">{t("badge_verified")}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="opacity-70">{t("dash_data_integrity")}</span>
                     <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-400">{t("badge_hashed")}</Badge>
                  </div>
                  <Separator className="bg-slate-800" />
                  <p className="text-[10px] opacity-50 italic">{t("track_security_footer")}</p>
               </CardContent>
            </Card>
          </div>

          {/* AI Answer Full Result */}
          <Card className="border-2 shadow-md">
             <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Scale className="h-5 w-5 text-dark-blue dark:text-gold" /> {t("dash_legal_analysis")}
                </CardTitle>
             </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {complaint.ai_answer ? (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-justify">
                      {complaint.ai_answer}
                    </p>
                    <Alert className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200">
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>{t("statutory_references")}</AlertTitle>
                      <AlertDescription className="text-xs opacity-70">
                         {complaint.ai_context || t("statutory_fallback")}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic">
                     {t("dash_ai_researching")}
                  </div>
                )}
             </CardContent>
          </Card>

          {/* FIR Record */}
          <Card className="border-2 shadow-lg overflow-hidden border-t-4 border-t-red-600">
             <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <div>
                   <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5" /> {t("fir_summary")}
                   </CardTitle>
                   <CardDescription>{t("fir_description")}</CardDescription>
                </div>
                {complaint.fir_text && (
                   <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> PDF
                   </Button>
                )}
             </CardHeader>
             <CardContent className="pt-6">
                {complaint.fir_text ? (
                   <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed p-6 rounded font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                      {complaint.fir_text}
                   </div>
                 ) : (role === "admin" || role === "lawyer") ? (
                   <div className="text-center py-8 space-y-4">
                      <p className="text-sm text-muted-foreground italic font-medium">{t("fir_not_generated")}</p>
                      <Button onClick={handleGenerateFIR} disabled={firLoading} className="bg-dark-blue dark:bg-gold text-white dark:text-dark-blue px-10">
                        {firLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t("fir_request_button")}
                      </Button>
                   </div>
                ) : (
                   <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground italic font-medium">{t("fir_not_generated")}</p>
                      <p className="text-xs text-muted-foreground mt-2">{t("fir_only_admin")}</p>
                   </div>
                )}
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
