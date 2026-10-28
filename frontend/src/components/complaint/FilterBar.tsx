import * as React from "react"
import { Search, Filter } from "lucide-react"

export const FilterBar = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by ID, keyword, or category..." 
          className="w-full bg-stitch-surface-container-low border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-stitch-gold focus:ring-1 focus:ring-stitch-gold/50 transition-all text-sm text-white placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-2">
        <select className="bg-stitch-surface-container-low border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-stitch-gold transition-all text-sm text-white appearance-none min-w-[140px] cursor-pointer">
          <option value="">All Statuses</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="flex items-center justify-center p-3 bg-stitch-surface-container-high rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
          <Filter className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  )
}
