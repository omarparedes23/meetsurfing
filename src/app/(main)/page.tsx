'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useLocation } from '@/hooks/useLocation'
import { useNearbyEvents } from '@/hooks/useNearbyEvents'
import { EventCard } from '@/components/events/EventCard'
import type { NearbyEvent } from '@/lib/supabase/types'
import { MapPin, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

const EventMap = dynamic(
  () => import('@/components/map/EventMap').then(m => m.EventMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" /> }
)

export default function HomePage() {
  const { coords, loading: locLoading, error: locError, permissionDenied, requestLocation } = useLocation()
  const { events, loading: eventsLoading, refetch } = useNearbyEvents(coords)
  const [selectedEvent, setSelectedEvent] = useState<NearbyEvent | null>(null)
  const [showMap, setShowMap] = useState(true)

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-57px)]">
      {/* Map */}
      {showMap && (
        <div className="h-64 relative border-b">
          <EventMap
            events={events}
            userCoords={coords}
            onEventSelect={setSelectedEvent}
          />
          {locLoading && (
            <div className="absolute top-2 left-2 bg-white rounded-full px-3 py-1 text-xs flex items-center gap-1 shadow">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              Getting location…
            </div>
          )}
        </div>
      )}

      {/* Toggle map */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <button
          onClick={() => setShowMap(v => !v)}
          className="text-xs text-blue-500 font-medium"
        >
          {showMap ? 'Hide map' : 'Show map'}
        </button>
        <div className="flex items-center gap-2">
          {coords && (
            <span className="text-xs text-gray-400 flex items-center gap-1" title="Click refresh to reload events">
              <MapPin className="w-3 h-3" /> {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          )}
          <button
            onClick={refetch}
            disabled={eventsLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <RefreshCw className={`w-4 h-4 ${eventsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Location error */}
      {(locError || permissionDenied) && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{locError}</p>
            {!permissionDenied && (
              <button onClick={requestLocation} className="mt-1 text-amber-600 font-medium underline text-xs">
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <h2 className="font-semibold text-gray-900">
          {eventsLoading ? 'Finding hangouts…' : `${events.length} hangout${events.length !== 1 ? 's' : ''} nearby`}
        </h2>

        {eventsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌇</p>
            <p className="text-gray-500 text-sm">No hangouts nearby.</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to create one!</p>
          </div>
        ) : (
          events.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}
