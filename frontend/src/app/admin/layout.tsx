"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  FileStack, 
  Scale, 
  ShieldAlert, 
  Settings,
  ChevronRight,
  LogOut,
  Loader2,
  Shield,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authorized, setAuthorized] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      router.push("/auth/login")
    } else {
      setAuthorized(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    router.push("/auth/login")
  }

  const menuItems = [
    { name: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Complaints", href: "/admin/complaints", icon: <FileStack className="h-4 w-4" /> },
    { name: "Counsel Roster", href: "/admin/lawyers", icon: <Scale className="h-4 w-4" /> },
    { name: "User Directory", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
    { name: "Audit Logs", href: "/admin/audit", icon: <Shield className="h-4 w-4" /> },
  ]

  if (!authorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-dark-blue dark:text-gold" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-dark-blue dark:text-gold uppercase tracking-tighter">
            <ShieldAlert className="h-6 w-6" />
            Neethivaan Admin
          </Link>
        </div>
        
        <Separator className="opacity-50" />
        
        <nav className="flex-1 p-4 space-y-2 pt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={`w-full justify-start gap-3 h-11 ${
                  isActive ? "bg-slate-100 dark:bg-slate-800 text-dark-blue dark:text-gold font-bold" : "text-muted-foreground"
                }`}
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.name}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                </Link>
              </Button>
            )
          })}
        </nav>

        <Separator className="opacity-50" />

        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-muted-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 h-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
