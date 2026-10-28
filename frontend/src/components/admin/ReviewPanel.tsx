import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Shuffle, ShieldAlert } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"

interface ReviewPanelProps {
  onAccept: () => void
  onReject: () => void
  onReassign?: () => void
  isUrgent?: boolean
}

export const ReviewPanel = ({ onAccept, onReject, onReassign, isUrgent }: ReviewPanelProps) => {
  return (
    <GlassPanel intensity="high" className="flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold font-manrope text-white">Administrative Actions</h3>
        {isUrgent && (
           <span className="flex items-center gap-1 text-xs font-bold text-destructive px-2 py-1 bg-destructive/10 rounded-md uppercase tracking-wider">
             <ShieldAlert className="h-4 w-4" /> Urgent Action Req
           </span>
        )}
      </div>

      <div className="space-y-4">
        <button 
          onClick={onAccept}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all group"
        >
          <CheckCircle className="h-5 w-5" />
          Accept & Initiate Proceedings
        </button>

        <button 
          onClick={onReject}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-bold hover:bg-destructive hover:text-white transition-all group"
        >
          <XCircle className="h-5 w-5" />
          Reject / Dismiss Query
        </button>

        {onReassign && (
          <button 
            onClick={onReassign}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stitch-surface-container-low text-white border border-white/5 rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            <Shuffle className="h-5 w-5 text-muted-foreground" />
            Reassign Counsel
          </button>
        )}
      </div>
      
      <div className="pt-4 mt-auto border-t border-white/5">
        <p className="text-xs text-muted-foreground text-center">
          Approving this case inherently binds the assigned party. All administrative overrides are logged securely in the ledger.
        </p>
      </div>
    </GlassPanel>
  )
}
