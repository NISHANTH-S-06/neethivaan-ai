"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

import { Stepper } from "@/components/complaint/Stepper"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { FileUpload } from "@/components/complaint/FileUpload"
import { complaintsService } from "@/lib/services/complaints"

const STEPS = ["Basic Info", "Case Details", "Attachments", "Confirmation"]

export default function NewComplaintPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Form State
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [priority, setPriority] = React.useState("medium")
  const [files, setFiles] = React.useState<File[]>([])

  const handleSubmit = async () => {
     try {
        setLoading(true)
        setError("")
        const res = await complaintsService.create({
           title,
           description,
           category
        });
        
        if (files.length > 0 && res.case_id) {
           for (const file of files) {
              await complaintsService.uploadFile(res.case_id, file);
           }
        }
        
        // Push directly to standard success confirmation screen
        router.push('/user/complaints/success')
     } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to submit complaint to secure vault.")
     } finally {
        setLoading(false)
     }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Complaint Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Breach of Contract by Vendor"
                className="w-full bg-stitch-surface-container-low border-b border-white/10 rounded-t-xl py-4 px-4 focus:outline-none focus:border-stitch-gold focus:bg-stitch-surface-container transition-all text-white placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description of Events</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the incident in detail..."
                rows={6}
                className="w-full bg-stitch-surface-container-low border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:border-stitch-gold focus:ring-1 focus:ring-stitch-gold/50 transition-all text-white placeholder:text-muted-foreground resize-none"
              />
            </div>
          </motion.div>
        )
      case 1:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Case Category</label>
              <select 
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
                 className="w-full bg-stitch-surface-container-low border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:border-stitch-gold focus:ring-1 focus:ring-stitch-gold/50 transition-all text-white appearance-none"
              >
                <option value="">Select a category...</option>
                <option value="civil">Civil Dispute</option>
                <option value="criminal">Criminal matter</option>
                <option value="cyber">Cyber Crime</option>
                <option value="family">Family Law</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Priority Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['low', 'medium', 'high'].map((pLevel) => (
                  <label key={pLevel} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      value={pLevel} 
                      checked={priority === pLevel}
                      onChange={(e) => setPriority(e.target.value)}
                      className="peer sr-only" 
                    />
                    <div className="text-center py-4 rounded-xl border border-white/10 bg-stitch-surface-container-low peer-checked:bg-stitch-gold/10 peer-checked:border-stitch-gold peer-checked:text-stitch-gold transition-all text-muted-foreground font-bold capitalize">
                      {pLevel}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FileUpload 
              files={files}
              onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
              onFileRemoved={(index) => setFiles(files.filter((_, i) => i !== index))}
            />
          </motion.div>
        )
      case 3:
         return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-6 py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stitch-gold/10 text-stitch-gold mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-3xl font-bold font-manrope">Ready for Review</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We have captured the details of your complaint. Proceed to securely sign and inject this packet into the active framework.
            </p>
             {error && (
                <div className="mt-4 p-4 text-sm font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                   {error}
                </div>
             )}
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-stitch-deep-blue text-foreground font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-manrope">Draft New Complaint</h1>
          <p className="text-muted-foreground text-lg">Secure, high-fidelity intake portal for your legal matters.</p>
        </div>

        {/* Stepper */}
        <div className="px-4">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Form Container */}
        <GlassPanel intensity="low" className="p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-muted-foreground hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={nextStep}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-stitch-gold to-[#c5a059] text-stitch-deep-blue rounded-xl font-bold hover:shadow-lg hover:shadow-stitch-gold/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : currentStep === STEPS.length - 1 ? "Sign & Submit" : "Continue"} {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
