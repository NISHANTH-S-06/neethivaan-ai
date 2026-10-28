import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, AlertTriangle, Key } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"

interface AIInsightPanelProps {
  category: string
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  keyPoints: string[]
}

export const AIInsightPanel = ({ category, riskLevel, keyPoints }: AIInsightPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-stitch-gold to-stitch-gold/60 p-[1px] rounded-3xl shadow-xl shadow-stitch-gold/5">
        <div className="bg-stitch-surface-container-lowest rounded-[23px] p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-stitch-gold/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-stitch-gold" />
            </div>
            <h3 className="text-xl font-bold font-manrope text-white">AI Analysis insight</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stitch-surface-container/50 rounded-xl border border-white/5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Suggested Category</p>
              <p className="text-lg font-bold text-white font-manrope">{category}</p>
            </div>
            <div className="p-4 bg-stitch-surface-container/50 rounded-xl border border-white/5 flex flex-col justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Risk Level</p>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${riskLevel === 'High' || riskLevel === 'Critical' ? 'text-destructive' : 'text-stitch-gold'}`} />
                <p className={`text-lg font-bold font-manrope ${riskLevel === 'High' || riskLevel === 'Critical' ? 'text-destructive' : 'text-stitch-gold'}`}>
                  {riskLevel}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-white/5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-2">
               <Key className="h-3 w-3" /> Key Extracted Points
            </p>
            <ul className="space-y-2">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80 leading-relaxed">
                  <span className="text-stitch-gold font-bold">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
