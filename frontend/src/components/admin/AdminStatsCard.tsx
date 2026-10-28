import * as React from "react"
import { motion } from "framer-motion"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"

interface AdminStatsCardProps {
  title: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  icon: LucideIcon
  colorTheme?: "primary" | "secondary" | "success" | "destructive"
}

export const AdminStatsCard = ({ title, value, change, trend, icon: Icon, colorTheme = "primary" }: AdminStatsCardProps) => {
  
  const colors = {
    primary: "text-primary bg-primary/10",
    secondary: "text-stitch-gold bg-stitch-gold/10",
    success: "text-emerald-500 bg-emerald-500/10",
    destructive: "text-destructive bg-destructive/10"
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null

  return (
    <GlassPanel intensity="low" className="p-6 relative group overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl ${colors[colorTheme]} transition-transform group-hover:scale-110 duration-500`}>
          <Icon className="h-6 w-6" />
        </div>
        
        {TrendIcon && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-destructive bg-destructive/10'}`}>
            <TrendIcon className="h-3 w-3" />
            {change}
          </div>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{title}</p>
        <h2 className="text-4xl font-bold font-manrope text-white">{value}</h2>
      </div>

      {/* Decorative Glow */}
      <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${
        colorTheme === 'primary' ? 'bg-primary' :
        colorTheme === 'secondary' ? 'bg-stitch-gold' :
        colorTheme === 'success' ? 'bg-emerald-500' : 'bg-destructive'
      }`} />
    </GlassPanel>
  )
}
