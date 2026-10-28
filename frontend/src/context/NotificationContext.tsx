"use client"

import * as React from "react"
import { notificationService, type Notification } from "@/lib/services/notifications"

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refresh: () => void
  markRead: (id: string) => void
  markAllRead: () => void
}

const NotificationContext = React.createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refresh: () => {},
  markRead: () => {},
  markAllRead: () => {},
})

export const useNotifications = () => React.useContext(NotificationContext)

const POLL_INTERVAL_MS = 30_000 // 30 seconds

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const fetchNotifications = React.useCallback(async () => {
    if (!localStorage.getItem("token")) return
    setLoading(true)
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
    } catch {
      // Silent - don't block UI if notifications fail
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!isLoggedIn) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isLoggedIn, fetchNotifications])

  const markRead = React.useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await notificationService.markRead(id)
  }, [])

  const markAllRead = React.useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await notificationService.markAllRead()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh: fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
