import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, AlertTriangle } from "lucide-react"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { StatusBadge, CaseStatus } from "./StatusBadge"

interface CaseCardProps {
  id: string
  title: string
  status: CaseStatus
  priority: "Low" | "Medium" | "High" | "Critical"
  date: string
  category: string
}

export const CaseCard = ({ id, title, status, priority, date, category }: CaseCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/user/complaints/${id}`}>
        <GlassPanel intensity="low" className="group hover:border-stitch-gold/30 transition-colors p-6 cursor-pointer">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{id}</span>
                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md uppercase tracking-wider">{category}</span>
                {priority === "High" || priority === "Critical" ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-destructive px-2 py-1 bg-destructive/10 rounded-md uppercase tracking-wider">
                    <AlertTriangle className="h-3 w-3" /> High Priority
                  </span>
                ) : null}
              </div>
              <h3 className="text-xl font-bold font-manrope text-white group-hover:text-stitch-gold transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground">Generated on {date}</p>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
              <StatusBadge status={status} />
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-stitch-gold/10 transition-colors">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-stitch-gold transition-colors" />
              </div>
            </div>
          </div>
        </GlassPanel>
      </Link>
    </motion.div>
  )
}
