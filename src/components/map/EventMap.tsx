'use client'

import { useEffect, useState } from 'react'
import type { NearbyEvent, Coordinates } from '@/lib/supabase/types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils'

interface EventMapProps {
  events: NearbyEvent[]
  userCoords: Coordinates | null
  onEventSelect: (event: NearbyEvent) => void
}

export function EventMap({ events, userCoords, onEventSelect }: EventMapProps) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: any
    TileLayer: any
    Marker: any
    Popup: any
    Circle: any
    L: any
  } | null>(null)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
    ]).then(([L, rl]) => {
      // Fix default marker icons
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        Circle: rl.Circle,
        L: L.default,
      })
    })
  }, [])

  if (!MapComponents) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading map…</div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, L } = MapComponents

  const center = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [40.416775, -3.70379] // Default: Madrid

  const createColoredIcon = (color: string) =>
    L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:${color};border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        transform:rotate(-45deg);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    })

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location */}
      {userCoords && (
        <Circle
          center={[userCoords.lat, userCoords.lng]}
          radius={100}
          pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.4 }}
        />
      )}

      {/* Events */}
      {events.map(event => {
        const color = CATEGORY_COLORS[event.category] ?? '#64748b'
        return (
          <Marker
            key={event.id}
            position={[0, 0]} // PostGIS returns no coords in RPC (location hidden); use city geocoding or store approximate
            icon={createColoredIcon(color)}
            eventHandlers={{ click: () => onEventSelect(event) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{event.title}</p>
                <p className="text-gray-500">{CATEGORY_LABELS[event.category]}</p>
                <p className="text-gray-500">{event.distance_km}km away</p>
                <p className="text-gray-500">
                  {event.current_participants}/{event.max_participants} people
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
