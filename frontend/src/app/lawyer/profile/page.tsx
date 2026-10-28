"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, User, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { lawyerService, type LawyerProfile } from "@/lib/services/lawyer"

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.string().min(2, "Specialization is required"),
  bio: z.string().optional(),
  is_available: z.boolean().optional(),
})
type ProfileFormValues = z.infer<typeof profileSchema>

export default function LawyerProfilePage() {
  const [profile, setProfile] = React.useState<LawyerProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", specialization: "", bio: "" },
  })

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await lawyerService.getLawyerProfile()
        setProfile(data)
        form.reset({
          full_name: data.full_name || "",
          specialization: data.specialization || "",
          bio: data.bio || "",
          is_available: data.is_available,
        })
      } catch {
        setError("Could not load profile.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [form])

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true)
    setError(null)
    try {
      await lawyerService.updateProfile(values)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-dark-blue dark:text-gold tracking-tight">Advocate Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your professional information.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3 border border-green-200">
          <CheckCircle className="h-4 w-4" /> Profile updated successfully.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Details
          </CardTitle>
          {profile?.email && <CardDescription>{profile.email}</CardDescription>}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Adv. Ramesh Kumar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="specialization" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area of Specialization</FormLabel>
                    <FormControl><Input placeholder="e.g. Criminal Law, Civil Disputes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio / Professional Summary</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of your experience and background..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={saving} className="w-full bg-dark-blue text-white hover:bg-dark-blue/90">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Profile"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card className="border-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gold">
            <ShieldCheck className="h-5 w-5" /> Verification Status
          </CardTitle>
          <CardDescription>Your account verification and Bar Council recognition.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {profile?.role === "lawyer" ? (
              <><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-medium text-green-600 dark:text-green-400">Verified Advocate</span></>
            ) : (
              <><div className="h-2 w-2 rounded-full bg-yellow-500" /><span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Verification</span></>
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <a href="/lawyer/verification">Manage Verification Documents</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
