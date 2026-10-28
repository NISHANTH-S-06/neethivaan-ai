"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Files, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  Activity,
  Users
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  className?: string
  overrideRole?: "admin" | "lawyer" | "user"
}

export function Sidebar({ className, overrideRole }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  
  const role = overrideRole || user?.role || "user"

  const navItems = React.useMemo(() => {
    switch (role) {
      case "admin":
        return [
          { name: "Command Center", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "All Cases", href: "/admin/cases", icon: Files },
          { name: "Lawyers", href: "/admin/lawyers", icon: Users },
          { name: "System Logs", href: "/admin/audit", icon: Activity },
          { name: "Settings", href: "/profile", icon: Settings },
        ]
      case "lawyer":
        return [
          { name: "Workspace", href: "/lawyer/dashboard", icon: LayoutDashboard },
          { name: "My Cases", href: "/lawyer/cases", icon: Files },
          { name: "Client Chat", href: "/chat", icon: MessageSquare },
          { name: "Profile", href: "/lawyer/profile", icon: Settings },
        ]
      case "user":
      default:
        return [
          { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "My Complaints", href: "/user/complaints", icon: Files },
          { name: "AI Legal Chat", href: "/chat", icon: MessageSquare },
          { name: "Profile Setting", href: "/profile", icon: Settings },
        ]
    }
  }, [role])

  return (
    <aside className={cn("flex w-64 flex-col border-r bg-slate-50 dark:bg-slate-900/50 min-h-screen", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-dark-blue dark:text-gold tracking-tighter uppercase transition-colors hover:opacity-80">
          <ShieldAlert className="h-5 w-5" />
          <span>Neethivaan</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-2 px-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive ? "bg-slate-200 text-dark-blue dark:bg-slate-800 dark:text-gold shadow-sm" : "text-slate-600 dark:text-slate-400"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-dark-blue dark:text-gold" : "text-slate-500")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="rounded-xl bg-slate-200/50 dark:bg-slate-800/50 p-4 text-center text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email || "Guest User"}</p>
          <p className="text-slate-500 capitalize mt-1 tracking-wider text-[10px] uppercase">{role} Account</p>
        </div>
      </div>
    </aside>
  )
}
