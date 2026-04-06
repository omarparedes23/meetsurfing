'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Coordinates } from '@/lib/supabase/types'

interface LocationState {
  coords: Coordinates | null
  error: string | null
  loading: boolean
  permissionDenied: boolean
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    error: null,
    loading: false,
    permissionDenied: false,
  })

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported' }))
      return
    }

    setState(s => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setState(s => ({ ...s, coords, loading: false }))

        // Update user location in Supabase (never exposed to other users via RLS)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase
              .from('users')
              .update({
                location: `POINT(${coords.lng} ${coords.lat})`,
                location_updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)
          }
        } catch {
          // Location update failure is non-critical
        }
      },
      (err) => {
        const isDenied = err.code === GeolocationPositionError.PERMISSION_DENIED
        setState(s => ({
          ...s,
          loading: false,
          permissionDenied: isDenied,
          error: isDenied
            ? 'Location permission denied. Please enable it in browser settings.'
            : 'Could not get your location.',
        }))
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 min cache
      }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return { ...state, requestLocation }
}
