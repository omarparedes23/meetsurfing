'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { NearbyEvent, Coordinates } from '@/lib/supabase/types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils'

// Fix Leaflet default marker icons (runs only client-side, file is already ssr:false)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Remove Ukrainian flag emoji added in Leaflet 1.9.3+
L.Map.addInitHook(function (this: L.Map) {
  const attribution = this.attributionControl
  if (attribution) {
    attribution.setPrefix(
      '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>'
    )
  }
})

interface EventMapProps {
  events: NearbyEvent[]
  userCoords: Coordinates | null
  onEventSelect: (event: NearbyEvent) => void
}

/**
 * Re-centers the map when userCoords changes.
 * Must be rendered inside MapContainer to access the Leaflet map instance.
 */
function MapCenterUpdater({ coords }: { coords: Coordinates | null }) {
  const map = useMap()

  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], map.getZoom())
    }
  }, [coords, map])

  return null
}

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

export function EventMap({ events, userCoords, onEventSelect }: EventMapProps) {
  const center: [number, number] = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [40.416775, -3.70379] // Fallback: Madrid (replaced as soon as GPS resolves)

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Re-centers map whenever GPS coords update */}
      <MapCenterUpdater coords={userCoords} />

      {/* User location indicator */}
      {userCoords && (
        <Circle
          center={[userCoords.lat, userCoords.lng]}
          radius={100}
          pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.4 }}
        />
      )}

      {/* Event markers — only rendered when RPC returns lat/lng */}
      {events
        .filter(event => event.lat != null && event.lng != null)
        .map(event => {
          const color = CATEGORY_COLORS[event.category] ?? '#64748b'
          return (
            <Marker
              key={event.id}
              position={[event.lat!, event.lng!]}
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
