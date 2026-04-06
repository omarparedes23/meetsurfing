'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Coordinates, NearbyEvent } from '@/lib/supabase/types'

export function useNearbyEvents(coords: Coordinates | null, radiusKm = 30) {
  const [events, setEvents] = useState<NearbyEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!coords) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: rpcError } = await supabase
        .rpc('get_nearby_events', {
          user_lat: coords.lat,
          user_lng: coords.lng,
          radius_km: radiusKm,
        })

      if (rpcError) throw rpcError
      setEvents((data as NearbyEvent[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [coords, radiusKm])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}
