"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { ActionToolbar } from "@/components/admin/ActionToolbar"
import { DataTable, ColumnDef } from "@/components/admin/DataTable"
import { adminService, type AdminUser } from "@/lib/services/admin"

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-400",
  user: "bg-blue-500/20 text-blue-400",
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getUsers()
      setUsers(data)
      
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.sub) setCurrentUser(payload.sub)
        } catch {}
      }
    } catch {
      setError("Failed to load user records.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSuspend = async (userId: string) => {
    if (!window.confirm("Are you sure you want to SUSPEND this user? They will lose all access immediately.")) return;
    try {
      await adminService.suspendUser(userId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to suspend user");
    }
  };

  const handleActivate = async (userId: string) => {
    if (!window.confirm("Restore access for this user?")) return;
    try {
      await adminService.activateUser(userId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to activate user");
    }
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(u => 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  const columns: ColumnDef<AdminUser>[] = [
    { key: "id", header: "System ID" },
    { 
      key: "full_name", 
      header: "Citizen Name",
      render: (item) => (
         <div className="flex flex-col">
            <span className="font-bold text-white">{item.full_name}</span>
            <span className="text-xs text-muted-foreground">{item.email}</span>
         </div>
      )
    },
    { 
      key: "role", 
      header: "Jurisdiction",
      render: (item) => (
         <Badge className={`${ROLE_COLORS[item.role] || ROLE_COLORS.user} border-0 uppercase text-[10px] font-black`}>
            {item.role}
         </Badge>
      )
    },
    { 
      key: "is_active", 
      header: "Status",
      render: (item) => (
         <span className={`h-2.5 w-2.5 rounded-full inline-block mr-2 ${item.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`} />
      )
    },
    { 
      key: "created_at", 
      header: "Registered Date",
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Network Action",
      align: "right",
      render: (item) => {
        const isSelf = currentUser === item.email;
        return (
          <div className="flex justify-end gap-2">
            {item.is_active ? (
              <Button 
                onClick={() => handleSuspend(item.id)} 
                disabled={isSelf}
                size="sm"
                variant="destructive"
                className="h-8 text-xs font-bold w-24"
              >
                {isSelf ? "ACTIVE" : "SUSPEND"}
              </Button>
            ) : (
              <Button 
                onClick={() => handleActivate(item.id)} 
                size="sm"
                variant="secondary"
                className="h-8 text-xs font-bold w-24 bg-green-500/20 text-green-400 hover:bg-green-500/40"
              >
                ACTIVATE
              </Button>
            )}
          </div>
        )
      }
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
              <Users className="h-6 w-6" />
              <span className="text-sm font-bold uppercase tracking-widest font-manrope">User Registry</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold font-manrope tracking-tight text-white mb-2"
            >
              Citizen Directory
            </motion.h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Manage all registered platform citizens, their account statuses, and system access.
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
              searchPlaceholder="Search citizen name or email..."
              primaryActionLabel="Invite Citizen"
            />
            
            <div className="p-2 sm:p-6">
              <DataTable 
                columns={columns} 
                data={filteredUsers} 
                keyExtractor={(item) => item.id}
              />
            </div>
          </GlassPanel>
        </motion.div>

      </div>
    </div>
  )
}
