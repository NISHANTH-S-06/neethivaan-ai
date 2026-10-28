"use client"

import * as React from "react"
import { FileText, ArrowRight, Clock, ShieldAlert } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CaseCardProps {
  caseId: string
  title: string
  clientName?: string
  status: string
  issueType?: string
  dateStr?: string
  onAction?: (caseId: string) => void
  actionLabel?: string
  priority?: "low" | "medium" | "high" | "critical"
  className?: string
}

const statusColors: Record<string, string> = {
  "ASSIGNED": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200",
  "UNDER_REVIEW": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200",
  "RESOLVED": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200",
  "CLOSED": "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
  "ESCALATED": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200",
}

export function CaseCard({
  caseId,
  title,
  clientName,
  status,
  issueType,
  dateStr,
  onAction,
  actionLabel = "View Details",
  priority,
  className
}: CaseCardProps) {
  
  return (
    <Card className={cn("hover:shadow-lg transition-shadow border-l-4", priority === 'critical' || priority === 'high' ? "border-l-red-500" : "border-l-dark-blue dark:border-l-gold", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{caseId}</span>
              {priority === "critical" && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-black uppercase"><ShieldAlert className="h-3 w-3 mr-1" /> Critical</Badge>
              )}
            </div>
            <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
          </div>
          <Badge className={cn("text-xs font-semibold whitespace-nowrap shadow-none rounded-md", statusColors[status.toUpperCase()] || "bg-slate-100 text-slate-800")}>
            {status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
         <div className="space-y-2 text-sm">
            {(clientName || issueType) && (
              <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400">
                {clientName && <span><span className="font-semibold">Client:</span> {clientName}</span>}
                {issueType && <span><span className="font-semibold">Type:</span> {issueType}</span>}
              </div>
            )}
            {dateStr && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                 <Clock className="h-3 w-3" />
                 Last Updated: {dateStr}
              </div>
            )}
         </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t">
         <div className="w-full flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-medium text-dark-blue dark:text-gold cursor-pointer hover:underline">
             {issueType && <FileText className="h-3 w-3" />}
             {issueType ? `${issueType} Document` : 'Case File'}
           </div>
           
           {onAction && (
             <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onAction(caseId)}>
               {actionLabel} <ArrowRight className="h-3 w-3" />
             </Button>
           )}
         </div>
      </CardFooter>
    </Card>
  )
}
