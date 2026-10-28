import * as React from "react"
import { Search, Filter, Plus, Download } from "lucide-react"

interface ActionToolbarProps {
  onSearch: (value: string) => void
  onFilterToggle: () => void
  searchPlaceholder?: string
  primaryActionLabel?: string
  primaryActionIcon?: React.ReactNode
  onPrimaryAction?: () => void
}

export const ActionToolbar = ({
  onSearch,
  onFilterToggle,
  searchPlaceholder = "Search records...",
  primaryActionLabel,
  primaryActionIcon,
  onPrimaryAction
}: ActionToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full p-4 bg-stitch-surface-container/50 border-b border-white/5 rounded-t-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-stitch-surface-container-low border border-white/5 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-stitch-gold transition-all text-sm text-white placeholder:text-muted-foreground"
          />
        </div>
        <button 
          onClick={onFilterToggle}
          className="p-2 border border-white/5 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center text-muted-foreground hover:text-white"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
          <Download className="h-4 w-4" /> Export
        </button>
        {primaryActionLabel && onPrimaryAction && (
          <button 
            onClick={onPrimaryAction}
            className="flex items-center gap-2 px-4 py-2 bg-stitch-gold text-stitch-deep-blue rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors"
          >
            {primaryActionIcon || <Plus className="h-4 w-4" />}
            {primaryActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
