"use client"

import * as React from "react"
import { apiClient } from "@/lib/api"
import { Scale, Bot, Send, Loader2, ShieldCheck, HelpCircle, History, BookOpen, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function LawyerConsultationPage() {
  const [question, setQuestion] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [history, setHistory] = React.useState<{ q: string, a: string }[]>([])

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    try {
      const response = await apiClient.post("/lawyer/ask", { question: question })
      setHistory(prev => [{ q: question, a: response.data.answer }, ...prev])
      setQuestion("")
      setError(null)
    } catch (err: any) {
      console.error("Lawyer AI call failed:", err)
      setError("AI connection failed. Retrying later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-dark-blue dark:text-gold tracking-tight">Expert Legal Console</h1>
          <p className="text-muted-foreground text-sm">Advanced retrieval-augmented generation for section lookup and precedent verification.</p>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-0 flex items-center gap-1.5 px-3 py-1">
          <ShieldCheck className="h-4 w-4" /> SECURE ADVOCATE NODE
        </Badge>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 flex-1">
        {/* Left: History & Tools */}
        <div className="lg:col-span-1 space-y-6 hidden lg:block">
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                 <History className="h-3.5 w-3.5" /> Recent Consultations
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {history.length === 0 ? (
                 <p className="text-[10px] text-muted-foreground italic">No session history yet.</p>
               ) : (
                 history.slice(0, 5).map((h, i) => (
                   <div key={i} className="text-[10px] p-2 bg-slate-50 dark:bg-slate-900 rounded border hover:border-gold cursor-pointer transition-all truncate group">
                     <span className="font-bold opacity-50 block mb-1">Q: {h.q}</span>
                   </div>
                 ))
               )}
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                 <BookOpen className="h-3.5 w-3.5" /> Legal Resources
               </CardTitle>
             </CardHeader>
             <CardContent>
                <ul className="text-[10px] space-y-2 text-blue-600 dark:text-gold font-medium underline">
                  <li><a href="#">Indian Penal Code (Full)</a></li>
                  <li><a href="#">Criminal Procedure Code</a></li>
                  <li><a href="#">IT Act 2000 & Amendments</a></li>
                </ul>
             </CardContent>
           </Card>
        </div>

        {/* Main: Chat Console */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center text-sm shadow-sm">
                <AlertCircle className="h-4 w-4 mr-2" /> {error}
             </div>
           )}
           <Card className="flex-1 flex flex-col shadow-xl border-2">
              <CardHeader className="bg-dark-blue text-white dark:bg-slate-900 border-b p-4">
                 <div className="flex items-center gap-3">
                    <div className="bg-gold p-2 rounded-lg">
                       <Bot className="h-5 w-5 text-dark-blue" />
                    </div>
                    <div>
                       <CardTitle className="text-md">Neethivaan Legal Oracle</CardTitle>
                       <CardDescription className="text-slate-400 text-[10px]">Real-time legal research and statutory compliance verify</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px] bg-slate-50/50 dark:bg-slate-950/50">
                 {history.length === 0 && !loading && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 pt-12">
                      <Scale className="h-16 w-16" />
                      <p className="max-w-xs text-sm">Initiate an expert query to begin Section-wise analysis of the legal database.</p>
                   </div>
                 )}

                 {history.map((h, i) => (
                   <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-end">
                         <div className="bg-dark-blue text-white dark:bg-gold dark:text-dark-blue px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] text-sm font-medium shadow-sm">
                            {h.q}
                         </div>
                      </div>
                      <div className="flex justify-start">
                         <div className="bg-white dark:bg-slate-800 border shadow-sm px-6 py-4 rounded-2xl rounded-tl-none max-w-[95%] text-sm leading-relaxed text-justify">
                            <Badge variant="outline" className="mb-3 text-[10px] uppercase tracking-widest font-black text-dark-blue dark:text-gold">Legal Analysis Output</Badge>
                            <p className="whitespace-pre-wrap">{h.a}</p>
                         </div>
                      </div>
                   </div>
                 ))}

                 {loading && (
                   <div className="flex justify-start animate-pulse">
                      <div className="bg-white dark:bg-slate-800 border-2 border-dashed px-6 py-5 rounded-2xl rounded-tl-none space-y-3 w-[70%]">
                         <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                         <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                         <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                         <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      </div>
                   </div>
                 )}
              </CardContent>
              <CardFooter className="p-4 bg-white dark:bg-slate-900 border-t">
                 <form onSubmit={handleAsk} className="flex gap-2 w-full">
                    <Input 
                      placeholder="Enter legal section, crime type, or procedural query..." 
                      className="h-14 font-medium"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !question.trim()} className="h-14 w-14 bg-dark-blue dark:bg-gold text-white dark:text-dark-blue">
                       {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                    </Button>
                 </form>
              </CardFooter>
           </Card>
           <p className="text-[10px] text-center text-muted-foreground italic">
              AI-generated responses are derived from digitized Indian Statute books. Advocates are advised to cross-reference with official Gazettes.
           </p>
        </div>
      </div>
    </div>
  )
}
