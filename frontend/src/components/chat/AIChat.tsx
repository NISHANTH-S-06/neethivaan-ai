"use client"

import * as React from "react"
import { Send, Loader2, Bot, User, Scale, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
}

export interface AIChatProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  placeholder?: string
  title?: string
  description?: string
  className?: string
}

export function AIChat({
  messages,
  isLoading,
  onSendMessage,
  placeholder = "Ask a legal question...",
  title = "AI Legal Assistant",
  description = "Get quick research and references.",
  className
}: AIChatProps) {
  const [inputState, setInputState] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputState.trim() || isLoading) return
    onSendMessage(inputState.trim())
    setInputState("")
  }

  return (
    <Card className={cn("flex flex-col h-[500px] border-2 shadow-sm", className)}>
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
            <Scale className="h-5 w-5 text-dark-blue dark:text-gold" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <div className="h-full w-full px-4 py-4 overflow-y-auto" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
              <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">No messages yet.</p>
              <p className="text-xs mt-1">Start by asking a question about laws, procedures, or cases.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border",
                    msg.role === "user" 
                      ? "bg-dark-blue text-white dark:bg-gold dark:text-dark-blue border-transparent" 
                      : msg.role === "system"
                        ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        : "bg-white text-dark-blue border-dark-blue dark:bg-slate-900 dark:border-gold dark:text-gold"
                  )}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : msg.role === "system" ? <ShieldAlert className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user" 
                      ? "bg-dark-blue/10 text-slate-900 dark:bg-gold/10 dark:text-slate-100 rounded-tr-none" 
                      : msg.role === "system"
                        ? "bg-slate-100 text-slate-500 text-xs italic rounded-tl-none dark:bg-slate-900"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border shadow-sm"
                  )}>
                    {msg.content}
                    {msg.timestamp && (
                      <span className="block mt-1 text-[10px] opacity-70">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                   <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border bg-white text-dark-blue border-dark-blue dark:bg-slate-900 dark:border-gold dark:text-gold">
                      <Bot className="h-4 w-4" />
                   </div>
                   <div className="rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-tl-none border shadow-sm flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t bg-slate-50 dark:bg-slate-900/50">
        <form onSubmit={handleSend} className="flex w-full items-center gap-2">
          <Input 
            value={inputState}
            onChange={(e) => setInputState(e.target.value)}
            disabled={isLoading}
            placeholder={placeholder}
            className="flex-1 bg-white dark:bg-slate-950 focus-visible:ring-dark-blue dark:focus-visible:ring-gold"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputState.trim() || isLoading}
            className="bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue flex-shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
