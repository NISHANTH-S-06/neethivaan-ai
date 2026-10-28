import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { CaseStatus } from "./StatusBadge"

interface TimelineEvent {
  status: CaseStatus
  date: string
  description: string
}

interface TimelineProps {
  currentStatus: CaseStatus
  events: TimelineEvent[]
}

const timelineOrder: CaseStatus[] = [
  "Submitted",
  "Under Review",
  "In Progress",
  "Completed"
]

export const Timeline = ({ currentStatus, events }: TimelineProps) => {
  const currentIndex = timelineOrder.indexOf(currentStatus) === -1 && currentStatus === "Rejected"
    ? timelineOrder.length // Force end if rejected
    : timelineOrder.indexOf(currentStatus)

  return (
    <div className="relative space-y-8 pl-4">
      {/* Structural Line */}
      <div className="absolute top-4 bottom-4 left-[23px] w-[2px] bg-white/5" />
      
      {/* Active Line (fill) */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: `${(currentIndex / Math.max((timelineOrder.length - 1), 1)) * 100}%` }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute top-4 left-[23px] w-[2px] bg-gradient-to-b from-stitch-gold to-primary"
      />

      {timelineOrder.map((status, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        const event = events.find(e => e.status === status)

        return (
          <div key={status} className="relative flex gap-6 z-10 group">
            {/* Node */}
            <motion.div 
              initial={false}
              animate={{
                backgroundColor: isCompleted ? "var(--stitch-gold)" : "var(--stitch-surface-container-high)",
                borderColor: isCompleted ? "var(--stitch-gold)" : "var(--stitch-surface-container-highest)",
              }}
              className={`w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center transition-all ${isCurrent ? 'ring-4 ring-stitch-gold/20' : ''}`}
            >
              {isCompleted && <Check className="h-2 w-2 text-stitch-deep-blue" />}
            </motion.div>

            {/* Content */}
            <div className={`flex-1 space-y-1 ${!isCompleted ? 'opacity-50' : 'opacity-100'}`}>
              <h4 className="text-sm font-bold font-manrope text-white">{status}</h4>
              {event && (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{event.date}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-sm">{event.description}</p>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
