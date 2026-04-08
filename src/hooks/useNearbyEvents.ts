'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Coordinates, NearbyEvent } from '@/lib/supabase/types'

export function useNearbyEvents(coords: Coordinates | null, radiusKm = 30) {
  const [events, setEvents] = useState<NearbyEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coordsRef = useRef(coords)
  coordsRef.current = coords

  const fetchEvents = useCallback(async () => {
    const currentCoords = coordsRef.current
    if (!currentCoords) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: rpcError } = await supabase
        .rpc('get_nearby_events', {
          user_lat: currentCoords.lat,
          user_lng: currentCoords.lng,
          radius_km: radiusKm,
        })

      if (rpcError) throw rpcError
      setEvents((data as NearbyEvent[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [radiusKm])

  // Initial fetch when coords arrive
  useEffect(() => {
    if (coords) fetchEvents()
  }, [coords, fetchEvents])

  // Realtime: re-fetch when any event is inserted, updated, or deleted
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('cs_events_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cs_events' },
        () => {
          // A new or changed event arrived — re-fetch to apply distance filter
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}
