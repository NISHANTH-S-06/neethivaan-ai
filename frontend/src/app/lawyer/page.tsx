"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LawyerRootRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/lawyer/dashboard")
  }, [router])

  return null
}
