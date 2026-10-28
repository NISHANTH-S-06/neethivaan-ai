import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { HTMLMotionProps } from "framer-motion"

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  intensity?: "low" | "medium" | "high"
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, intensity = "medium", ...props }, ref) => {
    
    const bgClass = {
      low: "bg-stitch-surface-container/20",
      medium: "bg-stitch-surface-container/40",
      high: "bg-stitch-surface-container/60",
    }[intensity]

    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, borderColor: "rgba(201, 168, 76, 0.2)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "backdrop-blur-xl border border-white/5 rounded-2xl p-6 overflow-hidden relative transition-colors duration-500",
          bgClass,
          className
        )}

        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {children}
      </motion.div>
    )
  }
)
GlassPanel.displayName = "GlassPanel"
