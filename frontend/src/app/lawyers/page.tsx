"use client"

import * as React from "react"
import { api } from "@/lib/api"


type Lawyer = {
  id: string
  full_name?: string
  email?: string
  specialization?: string
  bio?: string
  is_available?: boolean
}

export default function LawyersPage() {
  const [lawyers, setLawyers] = React.useState<Lawyer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get("lawyers")

        const data = res.data

        if (!cancelled) setLawyers(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load lawyers")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-10">
      <h1>Lawyer Portal</h1>
      <p>Connect with legal professionals.</p>

      {loading ? (
        <div className="mt-6">Loading...</div>
      ) : error ? (
        <div className="mt-6 text-red-600">{error}</div>
      ) : lawyers.length === 0 ? (
        <div className="mt-6">No lawyers found.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {lawyers.map((l) => (
            <div key={l.id} className="border border-white/10 rounded-xl p-4">
              <div className="font-bold">{l.full_name || "Unnamed Lawyer"}</div>
              <div className="text-sm opacity-80">{l.specialization || "General"}</div>
              {l.bio ? <div className="text-sm mt-2 opacity-70">{l.bio}</div> : null}
              <div className="text-xs mt-2 opacity-60">
                {l.is_available === false ? "Busy" : "Available"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
