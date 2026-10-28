"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ComplaintForm } from "@/components/complaint-form"

export default function RegisterPage() {
  const router = useRouter()

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Please login to register a complaint.")
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12 space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-dark-blue dark:text-gold sm:text-5xl">
          Register Your Case
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Our specialized legal AI and human experts are here to help. Follow the steps below to file a comprehensive complaint.
        </p>
      </div>

      <ComplaintForm />
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Your data is encrypted and handled with extreme confidentiality.</p>
        <p className="mt-2">Need help? <a href="#" className="underline hover:text-dark-blue dark:hover:text-gold">Contact Support</a></p>
      </div>
    </div>
  )
}
