"use client"

import * as React from "react"
import Link from 'next/link'
import { apiClient } from "@/lib/api"
import { MessageSquare, Loader2, Send, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AwarenessPortal() {
  const [question, setQuestion] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [chatHistory, setChatHistory] = React.useState<{ q: string, a: string }[]>([])

  const [articles, setArticles] = React.useState<any[]>([])

  React.useEffect(() => {
    apiClient.get("/awareness/articles").then(res => setArticles(res.data)).catch(console.error)
  }, [])

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    try {
      const response = await apiClient.post("/rag-chat", { query: question })
      setChatHistory(prev => [...prev, { q: question, a: response.data.answer }])
      setQuestion("")
    } catch (err) {
      console.error("RAG Chat failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-dark-blue dark:text-gold tracking-tight sm:text-5xl">
          Legal Awareness Portal
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Empowering citizens with easy-to-understand legal rights, government schemes, and AI-powered procedural guides.
        </p>
      </div>

      {/* AI Chat Section */}
      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="bg-dark-blue text-white dark:bg-slate-900 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-gold p-2 rounded-lg">
              <Scale className="h-6 w-6 text-dark-blue" />
            </div>
            <div>
              <CardTitle>Neethivaan Legal AI</CardTitle>
              <CardDescription className="text-slate-300">Ask any question about Indian Laws & Procedures</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
            {chatHistory.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <MessageSquare className="h-12 w-12" />
                <p>No questions yet. Try asking: "What are the penalties for cyber crime in India?"</p>
              </div>
            )}
            
            {chatHistory.map((chat, i) => (
              <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-end">
                  <div className="bg-dark-blue text-white dark:bg-gold dark:text-dark-blue px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] font-medium">
                    {chat.q}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border shadow-sm px-6 py-4 rounded-2xl rounded-tl-none max-w-[90%] text-sm leading-relaxed">
                    <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider font-bold">AI Legal Assistant</Badge>
                    <p className="whitespace-pre-wrap">{chat.a}</p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-slate-800 border px-6 py-4 rounded-2xl rounded-tl-none space-y-2 w-[60%]">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-900 border-t">
            <form onSubmit={handleAsk} className="flex gap-2">
              <Input 
                placeholder="Type your legal query here..." 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                className="flex-1 h-12"
              />
              <Button type="submit" size="icon" disabled={loading || !question.trim()} className="h-12 w-12 bg-dark-blue dark:bg-gold dark:text-dark-blue">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-8 h-1 bg-gold rounded-full"></span>
          Knowledge Base
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.slug} href={`/awareness/${article.slug}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group h-full border-t-4 border-t-gold">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">{article.type}</Badge>
                  <CardTitle className="group-hover:text-dark-blue dark:group-hover:text-gold transition-colors">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                    Read detailed guide <span>→</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
