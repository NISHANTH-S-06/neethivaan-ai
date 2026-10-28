"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, ShieldCheck, Mail, Lock, AlertCircle, User as UserIcon } from "lucide-react"

export default function RegisterUserPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await authService.register({
        email,
        password,
        full_name: fullName,
        role: "user"
      })
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check your data.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
     return (
       <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
         <Card className="w-full max-w-md border-2 shadow-2xl text-center p-8">
            <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2">Registration Successful</CardTitle>
            <CardDescription>Redirecting to secure login...</CardDescription>
         </Card>
       </div>
     )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-2 text-center pb-8 border-b bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="mx-auto bg-dark-blue dark:bg-gold p-3 rounded-2xl w-fit mb-2 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white dark:text-dark-blue" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter text-dark-blue dark:text-gold uppercase">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Join the Neethivaan secure platform
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-4">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="pl-10 h-12 text-md focus-visible:ring-gold"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="pl-10 h-12 text-md focus-visible:ring-gold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Secret Key / Password"
                  className="pl-10 h-12 text-md focus-visible:ring-gold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-black text-lg shadow-xl shadow-dark-blue/20 dark:shadow-gold/10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  CREATING ACCOUNT...
                </>
              ) : (
                "REGISTER"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-slate-50/30 dark:bg-slate-900/10 rounded-b-xl">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/auth/login" className="font-bold text-dark-blue dark:text-gold hover:underline">
              Login here
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
