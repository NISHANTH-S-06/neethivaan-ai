"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Scale, ShieldCheck, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { ActionToolbar } from "@/components/admin/ActionToolbar"
import { DataTable, ColumnDef } from "@/components/admin/DataTable"

import { adminService, type AdminLawyer } from "@/lib/services/admin"

export default function AdminLawyersPage() {
  const [lawyers, setLawyers] = React.useState<AdminLawyer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getLawyers()
      setLawyers(data)
    } catch (err) {
      console.error("Failed to load lawyers:", err)
      setError("Failed to load lawyer roster.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredLawyers = React.useMemo(() => {
    return lawyers.filter(l => 
      l.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      l.specialization?.toLowerCase().includes(search.toLowerCase())
    )
  }, [lawyers, search])

  const columns: ColumnDef<AdminLawyer>[] = [
    { key: "id", header: "License ID" },
    { 
      key: "full_name", 
      header: "Counsel Name",
      render: (item) => (
         <div className="flex flex-col">
            <span className="font-bold text-white flex items-center gap-1">
               {item.full_name} {item.is_active && <ShieldCheck className="h-3 w-3 text-stitch-gold"/>}
            </span>
            <span className="text-xs text-muted-foreground">{item.email}</span>
         </div>
      )
    },
    { 
      key: "is_active", 
      header: "Verification",
      render: (item) => (
         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            item.is_active ? "bg-stitch-gold/10 text-stitch-gold" : "bg-muted text-muted-foreground"
         }`}>
            {item.is_active ? "Verified" : "Pending"}
         </span>
      )
    },
    { 
      key: "specialization", 
      header: "Specialization",
      render: (item) => <span className="text-sm font-medium text-white px-2 py-1 bg-stitch-surface-container-low rounded-md">{item.specialization || "General"}</span>
    },
    { 
        key: "is_available", 
        header: "Availability", 
        align: "center",
        render: (item) => (
            <Badge variant={item.is_available ? "default" : "secondary"}>
                {item.is_available ? "Available" : "Busy"}
            </Badge>
        )
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (item) => (
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-stitch-gold"
            >
              <Scale className="h-6 w-6" />
              <span className="text-sm font-bold uppercase tracking-widest font-manrope">Counsel Registry</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold font-manrope tracking-tight text-white mb-2"
            >
              Legal Roster
            </motion.h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Verify legal credentials, monitor performance, and manage counsel admittance.
            </p>
          </div>
        </div>

        {/* Global Toolbar + Table Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel className="p-0 border border-white/5 shadow-2xl">
            <ActionToolbar 
              onSearch={setSearch}
              onFilterToggle={() => {}}
              searchPlaceholder="Search counsel name or firm..."
              primaryActionLabel="Onboard Counsel"
            />
            
            <div className="p-2 sm:p-6">
              <DataTable 
                columns={columns} 
                data={filteredLawyers} 
                keyExtractor={(item) => item.id}
              />
            </div>
          </GlassPanel>
        </motion.div>

      </div>
    </div>
  )
}
