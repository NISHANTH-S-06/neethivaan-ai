"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Loader2, ShieldCheck, UploadCloud, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { lawyerService } from "@/lib/services/lawyer"

type VerificationFormValues = { bar_council_number: string; specialization: string; years_experience: string; bio: string }

const STEPS = ["Bar Council Details", "Upload Documents", "Review & Submit"]

export default function LawyerVerificationPage() {
  const [step, setStep] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [values, setValues] = React.useState<VerificationFormValues>({
    bar_council_number: "", specialization: "", years_experience: "", bio: ""
  })
  const [fieldErrors, setFieldErrors] = React.useState<Partial<VerificationFormValues>>({})

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files))
  }

  const handleChange = (field: keyof VerificationFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
    setFieldErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validateStep0 = () => {
    const errors: Partial<VerificationFormValues> = {}
    if (!values.bar_council_number || values.bar_council_number.length < 4) errors.bar_council_number = "Min 4 characters required"
    if (!values.specialization || values.specialization.length < 2) errors.specialization = "Specialization required"
    const yr = parseInt(values.years_experience, 10)
    if (isNaN(yr) || yr < 0 || yr > 60) errors.years_experience = "Enter a number between 0-60"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep0()) { setStep(0); return }
    setSubmitting(true)
    setError(null)
    try {
      await lawyerService.submitVerification({
        bar_council_number: values.bar_council_number,
        specialization: values.specialization,
        years_experience: parseInt(values.years_experience, 10),
        bio: values.bio,
      })
      setSubmitted(true)
    } catch {
      setError("Submission failed. Please check your details and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-extrabold text-dark-blue dark:text-white">Verification Submitted!</h2>
        <p className="text-muted-foreground max-w-sm">Your credentials have been received. An admin will review your application within 24-48 hours.</p>
        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-3 border border-yellow-200">
          <Clock className="h-4 w-4" /> Status: Pending Admin Approval
        </div>
        <Button variant="outline" asChild><a href="/lawyer/dashboard">Back to Dashboard</a></Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Lawyer Onboarding</p>
        <h1 className="text-3xl font-extrabold text-dark-blue dark:text-white font-manrope">Verification Portal</h1>
        <p className="text-muted-foreground mt-1">Submit your credentials for platform access as a verified advocate.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-sm font-medium ${i === step ? "text-dark-blue dark:text-gold" : i < step ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i === step ? "border-dark-blue dark:border-gold bg-dark-blue/10 dark:bg-gold/10 text-dark-blue dark:text-gold" : i < step ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/40 text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-green-500" : "bg-muted-foreground/20"}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 0: Credentials */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" />Bar Council Details</CardTitle>
                <CardDescription>Enter your official Bar Council registration information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bar Council Number *</label>
                  <Input placeholder="e.g. BCI/2019/12345" value={values.bar_council_number} onChange={e => handleChange("bar_council_number", e.target.value)} />
                  {fieldErrors.bar_council_number && <p className="text-xs text-red-500">{fieldErrors.bar_council_number}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Area of Specialization *</label>
                  <Input placeholder="e.g. Criminal Law, Civil Disputes" value={values.specialization} onChange={e => handleChange("specialization", e.target.value)} />
                  {fieldErrors.specialization && <p className="text-xs text-red-500">{fieldErrors.specialization}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience *</label>
                  <Input type="number" min={0} max={60} placeholder="e.g. 5" value={values.years_experience} onChange={e => handleChange("years_experience", e.target.value)} />
                  {fieldErrors.years_experience && <p className="text-xs text-red-500">{fieldErrors.years_experience}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Professional Bio</label>
                  <Textarea placeholder="Brief professional summary (optional)..." className="min-h-[80px]" value={values.bio} onChange={e => handleChange("bio", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Document Upload */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-gold" />Upload Documents</CardTitle>
                <CardDescription>Upload your Bar Council certificate and additional proof documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors">
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click to select documents</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG or PNG · Max 10MB per file</p>
                  <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFiles} />
                </label>
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map(f => (
                      <div key={f.name} className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{f.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Review & Submit */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gold" />Review Application</CardTitle>
                <CardDescription>Confirm your details before submission.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["Bar Council Number", values.bar_council_number],
                  ["Specialization", values.specialization],
                  ["Years of Experience", values.years_experience],
                  ["Bio", values.bio || "—"],
                  ["Documents Attached", selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : "None"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-semibold text-right max-w-xs truncate">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-between">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext} className="bg-dark-blue text-white hover:bg-dark-blue/90">
                  Next Step
                </Button>
              ) : (
                <Button type="submit" disabled={submitting} className="bg-gold text-dark-blue hover:bg-gold/90 font-bold px-8">
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit for Verification"}
                </Button>
              )}
            </div>
          </div>
        </form>
    </div>
  )
}
