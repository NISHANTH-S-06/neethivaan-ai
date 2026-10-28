"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Download, SearchCode, ArrowRight } from "lucide-react"
import Link from "next/link"

import { GlassPanel } from "@/components/ui/GlassPanel"

export default function SuccessComplaintPage() {
  const [caseId, setCaseId] = React.useState("")

  React.useEffect(() => {
    // Simulate generating a case ID on mount
    setCaseId(`NV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  }, [])

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <GlassPanel intensity="high" className="text-center p-8 sm:p-12 space-y-8 relative z-10 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold font-manrope text-white">Filing Successful</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                Your complaint has been successfully registered and encrypted into the Neethivaan secure vault.
              </p>
            </div>

            <div className="bg-stitch-surface-container-low border border-white/10 rounded-2xl p-6 my-8 inline-block w-full max-w-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Assigned Case ID</p>
              <div className="flex items-center justify-center gap-3">
                <SearchCode className="h-5 w-5 text-stitch-gold opacity-50" />
                <span className="text-3xl font-bold font-manrope tracking-wider text-stitch-gold">
                  {caseId || "NV-..."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 bg-stitch-surface-container hover:bg-stitch-surface-container-high text-white font-bold transition-all group">
                <Download className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                Download Receipt
              </button>
              
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-stitch-gold to-[#c5a059] text-stitch-deep-blue rounded-xl font-bold hover:shadow-[0_0_20px_rgba(233,193,118,0.2)] transition-all group"
              >
                Track Case
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </GlassPanel>
        </div>
      </motion.div>

    </div>
  )
}
