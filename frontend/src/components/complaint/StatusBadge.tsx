import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertCircle, PlayCircle, XCircle } from "lucide-react"

export type CaseStatus = "Submitted" | "Under Review" | "In Progress" | "Completed" | "Rejected"

interface StatusBadgeProps {
  status: CaseStatus
  showIcon?: boolean
}

const statusConfig = {
  "Submitted": {
    bg: "bg-stitch-surface-container-high",
    text: "text-muted-foreground",
    icon: Clock
  },
  "Under Review": {
    bg: "bg-stitch-gold/10",
    text: "text-stitch-gold",
    icon: AlertCircle
  },
  "In Progress": {
    bg: "bg-primary/10",
    text: "text-primary",
    icon: PlayCircle
  },
  "Completed": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    icon: CheckCircle2
  },
  "Rejected": {
    bg: "bg-destructive/10",
    text: "text-destructive",
    icon: XCircle
  }
}

export const StatusBadge = ({ status, showIcon = true }: StatusBadgeProps) => {
  const normalizedMap: Record<string, CaseStatus> = {
    "SUBMITTED": "Submitted",
    "UNDER_REVIEW": "Under Review",
    "IN_PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "REJECTED": "Rejected"
  }
  const normalizedStatus = normalizedMap[status as string] || status;
  const config = statusConfig[normalizedStatus as CaseStatus] || statusConfig["Submitted"]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 ${config.bg}`}>
      {showIcon && <Icon className={`h-4 w-4 ${config.text}`} />}
      <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
        {normalizedStatus}
      </span>
    </div>
  )
}
