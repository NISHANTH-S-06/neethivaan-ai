"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Paperclip, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import axios from "axios"

const formSchema = z.object({
  // Step 1: Basic Info
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  idType: z.string().min(1, { message: "Please select an ID type." }),
  idNumber: z.string().min(1, { message: "ID number is required." }),

  // Step 2: Description
  complaintTitle: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),

  // Step 3: Location
  address: z.string().min(5, { message: "Address is required." }),
  landmark: z.string().optional(),
  district: z.string().min(1, { message: "District is required." }),
  state: z.string().min(1, { message: "State is required." }),

  // Step 5: Witness
  witnessName: z.string().optional(),
  witnessContact: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const steps = [
  { id: 1, name: "Basic Info", icon: <User className="h-4 w-4" /> },
  { id: 2, name: "Description", icon: <FileText className="h-4 w-4" /> },
  { id: 3, name: "Location", icon: <MapPin className="h-4 w-4" /> },
  { id: 4, name: "Attachments", icon: <Paperclip className="h-4 w-4" /> },
  { id: 5, name: "Witness", icon: <Users className="h-4 w-4" /> },
  { id: 6, name: "Review", icon: <CheckCircle2 className="h-4 w-4" /> },
]

export function ComplaintForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submittedCaseId, setSubmittedCaseId] = React.useState<string | null>(null)
  const [files, setFiles] = React.useState<File[]>([])
  const [uploadStatus, setUploadStatus] = React.useState<{ [key: string]: string }>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      idType: "",
      idNumber: "",
      complaintTitle: "",
      description: "",
      category: "",
      address: "",
      landmark: "",
      district: "",
      state: "",
      witnessName: "",
      witnessContact: "",
    },
    mode: "onChange",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ["fullName", "email", "phone", "idType", "idNumber"]
    } else if (currentStep === 2) {
      fieldsToValidate = ["complaintTitle", "description", "category"]
    } else if (currentStep === 3) {
      fieldsToValidate = ["address", "district", "state"]
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid || currentStep === 4 || currentStep === 5) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      // 1. Create Complaint
      const payload = {
        title: data.complaintTitle,
        description: data.description,
        issue_type: data.category,
        complainant_name: data.fullName,
        email: data.email,
        phone: data.phone,
        id_type: data.idType,
        id_number: data.idNumber,
        location_text: `${data.address}, ${data.landmark ? data.landmark + ", " : ""}${data.district}, ${data.state}`,
        witness_name: data.witnessName || "",
        witness_contact: data.witnessContact || "",
      }

      const response = await apiClient.post("/complaints/", payload)
      const caseId = response.data.case_id
      setSubmittedCaseId(caseId)

      // 2. Handle Uploads
      if (files.length > 0) {
        for (const file of files) {
          try {
            setUploadStatus((prev) => ({ ...prev, [file.name]: "Generating URL..." }))
            
            // Get Presigned URL
            const urlResponse = await apiClient.post(`/complaints/${caseId}/attachments?file_name=${encodeURIComponent(file.name)}`)
            const { upload_url, storage_path } = urlResponse.data

            setUploadStatus((prev) => ({ ...prev, [file.name]: "Uploading..." }))
            
            // PUT to MinIO
            if (upload_url) {
              try {
                await axios.put(upload_url, file, {
                  headers: { "Content-Type": file.type }
                })
              } catch (error) {
                console.error("File upload failed, skipping", error)
              }
            }

            setUploadStatus((prev) => ({ ...prev, [file.name]: "Confirming..." }))
            
            // Confirm Upload
            await apiClient.post(`/complaints/${caseId}/attachments/confirm?storage_path=${encodeURIComponent(storage_path)}`)
            
            setUploadStatus((prev) => ({ ...prev, [file.name]: "Complete" }))
          } catch (uploadError) {
            console.error(`Upload failed for ${file.name}:`, uploadError)
            setUploadStatus((prev) => ({ ...prev, [file.name]: "Failed" }))
          }
        }
      }
      
      // Delay then redirect
      setTimeout(() => {
        router.push(`/tracking?id=${caseId}`)
      }, 5000)
    } catch (error: any) {
      console.error("Submission failed:", error)
      const errorMsg = error.response?.data?.detail || "Failed to submit complaint. Please try again."
      alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submittedCaseId) {
    return (
      <Card className="border-2 shadow-2xl animate-in zoom-in-95 duration-500">
        <CardContent className="py-20 flex flex-col items-center text-center space-y-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-dark-blue dark:text-gold">Complaint Filed Successfully!</h2>
            <p className="text-muted-foreground text-lg">Your case has been recorded in the central system.</p>
          </div>
          
          <div className="bg-muted p-6 rounded-lg border-2 border-dashed border-dark-blue/20 dark:border-gold/20 w-full max-w-md">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tracking ID</p>
            <p className="text-4xl font-black text-dark-blue dark:text-gold tracking-tighter mt-2">{submittedCaseId}</p>
          </div>

          {files.length > 0 && (
            <div className="w-full max-w-md space-y-2">
              <p className="text-sm font-semibold">Attachments Status:</p>
              {files.map((file) => (
                <div key={file.name} className="flex justify-between text-xs bg-muted/50 p-2 rounded border">
                  <span>{file.name}</span>
                  <span className={uploadStatus[file.name] === "Complete" ? "text-green-600 font-bold" : "text-dark-blue dark:text-gold animate-pulse"}>
                    {uploadStatus[file.name]}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-4 pt-4 border-t w-full">
            <p className="text-sm italic text-muted-foreground">Redirecting to tracking dashboard in 5 seconds...</p>
            <Button 
              onClick={() => router.push(`/tracking?id=${submittedCaseId}`)}
              className="bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-bold px-10"
            >
              Go to Tracking Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="relative flex justify-between">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 -z-10" />
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="flex flex-col items-center gap-2 bg-background px-2"
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                currentStep >= step.id 
                  ? "bg-dark-blue border-dark-blue text-white dark:bg-gold dark:border-gold dark:text-dark-blue" 
                  : "bg-background border-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
            </div>
            <span 
              className={`text-xs font-medium hidden md:block ${
                currentStep === step.id ? "text-dark-blue dark:text-gold" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription>Step {currentStep} of {steps.length}</CardDescription>
            </div>
            <Badge variant="outline" className="text-dark-blue border-dark-blue dark:text-gold dark:border-gold">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 00000 00000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="idType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aadhar">Aadhar Card</SelectItem>
                              <SelectItem value="voter">Voter ID</SelectItem>
                              <SelectItem value="pan">PAN Card</SelectItem>
                              <SelectItem value="passport">Passport</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ID number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Description */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="complaintTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaint Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief title of the incident" {...field} />
                        </FormControl>
                        <FormDescription>Example: Theft at Main Street Market</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="theft">Theft/Robbery</SelectItem>
                            <SelectItem value="assault">Physical Assault</SelectItem>
                            <SelectItem value="harassment">Harassment</SelectItem>
                            <SelectItem value="fraud">Financial Fraud</SelectItem>
                            <SelectItem value="cyber">Cyber Crime</SelectItem>
                            <SelectItem value="property">Property Dispute</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide as much detail as possible about the incident..." 
                            className="min-h-[150px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Address / Location</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Street, area, building number..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmark (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Near..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter district" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Attachments */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div 
                    className="border-2 border-dashed rounded-lg p-10 text-center space-y-4 hover:bg-muted/50 transition-colors cursor-pointer relative"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <Paperclip className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">Click to select files or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, JPEG, PNG, DOCX (Max 10MB per file)</p>
                    </div>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      multiple 
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Selected Files ({files.length})</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg group">
                            <div className="flex items-center gap-3 truncate">
                              <FileText className="h-4 w-4 text-dark-blue dark:text-gold shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <p>Uploading clear evidence (photos of scene, documents, recordings) can help expedite your case processing by our AI legal analysts.</p>
                  </div>
                </div>
              )}

              {/* Step 5: Witness */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-dark-blue dark:text-gold" />
                    <h3 className="text-lg font-semibold">Witness Information (Optional)</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="witnessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Witness Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name of witness" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="witnessContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Witness Contact (Phone/Email)</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 XXXX / email@..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-bold flex items-center gap-2 text-dark-blue dark:text-gold border-b pb-1">
                        <User className="h-4 w-4" /> Complainant
                      </h4>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {form.getValues("fullName")}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Email:</span> {form.getValues("email")}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {form.getValues("phone")}</p>
                      <p className="text-sm"><span className="text-muted-foreground">ID:</span> {form.getValues("idType")} ({form.getValues("idNumber")})</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold flex items-center gap-2 text-dark-blue dark:text-gold border-b pb-1">
                        <MapPin className="h-4 w-4" /> Location
                      </h4>
                      <div className="text-sm">
                        <p>{form.getValues("address")}</p>
                        {form.getValues("landmark") && <p className="text-muted-foreground text-xs">Landmark: {form.getValues("landmark")}</p>}
                        <p>{form.getValues("district")}, {form.getValues("state")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold flex items-center gap-2 text-dark-blue dark:text-gold border-b pb-1">
                      <FileText className="h-4 w-4" /> Complaint Details
                    </h4>
                    <div className="space-y-1">
                      <p className="font-semibold">{form.getValues("complaintTitle")}</p>
                      <Badge variant="secondary">{form.getValues("category")}</Badge>
                      <p className="text-sm text-justify pt-2">{form.getValues("description")}</p>
                    </div>
                  </div>

                  {form.getValues("witnessName") && (
                    <div className="space-y-2">
                      <h4 className="font-bold flex items-center gap-2 text-dark-blue dark:text-gold border-b pb-1">
                        <Users className="h-4 w-4" /> Witness
                      </h4>
                      <p className="text-sm">{form.getValues("witnessName")} ({form.getValues("witnessContact")})</p>
                    </div>
                  )}

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-xs text-yellow-800 dark:text-yellow-400 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      By submitting this complaint, you affirm that the information provided is true and accurate to the best of your knowledge. False reporting is a legal offense.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t pt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-dark-blue hover:bg-dark-blue/90 text-white dark:bg-gold dark:text-dark-blue font-bold px-8 flex items-center gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 flex items-center gap-2"
            >
              {isSubmitting ? "Submitting..." : "Final Submit"} <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
