"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/lib/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login: contextLogin } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await authService.login(email, password)
      
      if (data.access_token) {
        // Normalize role: user -> citizen
        const rawUser = data.user || {}
        let role = rawUser.role || data.role || "user"
        
        if (role === "user") {
          role = "citizen"
        }
        
        const normalizedUser = { ...rawUser, role }
        
        // Update global state
        contextLogin(data.access_token, normalizedUser)
        
        if (role === "admin") {
          router.push("/admin/dashboard")
        } else if (role === "lawyer") {
          router.push("/lawyer/dashboard")
        } else {
          router.push("/citizen/dashboard")
        }
      }
    } catch (err: any) {
      console.error("LoginPage: Login error", err)
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-dark-blue dark:border-t-gold animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border shadow-inner transition-transform hover:scale-105 duration-300">
            <ShieldCheck className="h-10 w-10 text-dark-blue dark:text-gold" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter uppercase font-manrope">Welcome Back</CardTitle>
            <CardDescription className="text-sm font-medium tracking-tight">Access the Neethivaan Legal Ecosystem</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-70">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-12 border-2 focus-visible:ring-dark-blue dark:focus-visible:ring-gold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-70">Password</Label>
                <button type="button" className="text-xs font-bold text-dark-blue dark:text-gold hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-2 focus-visible:ring-dark-blue dark:focus-visible:ring-gold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            <Button
              className="w-full h-12 bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-bold text-base uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authorize Access"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-b-xl">
          <div className="text-center text-sm font-medium">
            <span className="text-muted-foreground tracking-tight">New to the platform? </span>
            <button
              onClick={() => router.push("/auth/register")}
              className="text-dark-blue dark:text-gold font-bold hover:underline transition-all"
            >
              Create Identity
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
