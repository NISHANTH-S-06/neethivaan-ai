"use client"

import * as React from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Import leaflet.heat (this is a bit tricky with Next.js/TS)
import "leaflet.heat"

interface HeatmapProps {
  data: { lat: number; lng: number; count: number }[]
}

function HeatLayer({ data }: HeatmapProps) {
  const map = useMap()

  React.useEffect(() => {
    if (!map || !data.length) return

    const points = data.map(p => [p.lat, p.lng, p.count * 0.5]) as any[]
    
    // @ts-ignore - leaflet.heat adds heatLayer to L
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, data])

  return null
}

export default function Heatmap({ data }: HeatmapProps) {
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl relative z-0">
      <MapContainer 
        center={[20.5937, 78.9629]} // Center of India
        zoom={5} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer data={data} />
      </MapContainer>
    </div>
  )
}
