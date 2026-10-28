"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, ShieldAlert, Globe, LogOut, User as UserIcon, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/context/NotificationContext"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const { user, logout } = useAuth()
  const { t, setLanguage } = useLanguage()
  const notificationsContext = useNotifications()
  const { notifications, unreadCount, markRead, markAllRead } = notificationsContext

  const isLoggedIn = !!user
  const role = user?.role || null

  const handleLogout = () => {
    logout()
  }

  const NavItems = () => (
    <>
      <Link href="/tracking" className="text-sm font-medium transition-colors hover:text-gold">
        {t('navbar_track_complaint')}
      </Link>
      {isLoggedIn && (
        <>
          <Link href={role === "admin" ? "/admin/dashboard" : role === "lawyer" ? "/lawyer/dashboard" : "/dashboard"} className="text-sm font-medium transition-colors hover:text-gold">
            {t('navbar_dashboard')}
          </Link>
          <Link href="/user/complaints/new" className="text-sm font-medium transition-colors hover:text-gold font-bold text-blue-600 dark:text-gold">
            {t('navbar_file_complaint')}
          </Link>
        </>
      )}
      <Link href="/awareness" className="text-sm font-medium transition-colors hover:text-gold">
        {t('navbar_legal_portal')}
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-dark-blue dark:text-gold" />
            <span className="hidden font-black sm:inline-block tracking-tighter uppercase">Neethivaan</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="flex flex-1 items-center justify-end space-x-6 md:justify-between">
          <div className="hidden md:flex items-center space-x-6">
            <NavItems />
          </div>
          <div className="flex items-center space-x-2">

            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')}>Hindi</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ta')}>Tamil</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications Bell */}
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">
                        Mark all read
                      </button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={`flex flex-col items-start gap-1 cursor-pointer py-2 px-3 ${!n.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                        onClick={() => markRead(n.id)}
                      >
                        <span className="text-xs font-semibold">{n.title}</span>
                        <span className="text-xs text-muted-foreground leading-tight">{n.message}</span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                  {role}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800">
                      <UserIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    {role === "lawyer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/lawyer/verification">Verification</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> {t('navbar_logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="default" className="bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-bold px-6" asChild>
                <Link href="/auth/login">{t('navbar_login')}</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="inline-flex items-center justify-center rounded-lg px-0 py-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden ml-2 border-0 bg-transparent cursor-pointer">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] border-l-gold">
                <div className="flex flex-col space-y-6 pt-10">
                  <NavItems />
                  <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800" />
                  {isLoggedIn ? (
                    <Button variant="outline" onClick={handleLogout} className="text-red-500 border-red-200">
                      {t('navbar_logout')}
                    </Button>
                  ) : (
                    <Button asChild className="bg-dark-blue dark:bg-gold dark:text-dark-blue">
                      <Link href="/auth/login">{t('navbar_login')}</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  )
}
