'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EventCategory, Coordinates } from '@/lib/supabase/types'
import { CATEGORY_LABELS } from '@/lib/utils'
import { Loader2, MapPin } from 'lucide-react'

interface EventFormProps {
  userCoords: Coordinates | null
}

export function EventForm({ userCoords }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'bar' as EventCategory,
    location_name: '',
    max_participants: 20,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userCoords) {
      setError('Please enable location access to create a hangout')
      return
    }
    
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    // Create event with user's current GPS location
    const { data: event, error: insertError } = await supabase
      .from('cs_events')
      .insert({
        creator_id: user.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        city: 'Unknown', // Can be enhanced with reverse geocoding later
        country: 'Unknown',
        location: `POINT(${userCoords.lng} ${userCoords.lat})`,
        location_name: form.location_name || null,
        address: null,
        starts_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Starts in 1 hour
        ends_at: null,
        max_participants: form.max_participants,
        visibility_radius_km: 30,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Creator joins automatically
    await supabase.from('cs_event_participants').insert({
      event_id: event.id,
      user_id: user.id,
      status: 'joined',
    })

    router.push(`/events/${event.id}`)
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {!userCoords && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">Location required</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Please allow location access in your browser to create a hangout.
            </p>
          </div>
        </div>
      )}

      {userCoords && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Using your GPS location
            </span>
          </div>
          <p className="text-xs text-green-600">
            Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>What do you want to do? *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          maxLength={100}
          placeholder="Cañas en Malasaña 🍺"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Tell people more...</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={300}
          rows={3}
          placeholder="Alguien se anima? Vamos a tomar algo y conocernos"
          className={inputClass + ' resize-none'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Max people</label>
          <input
            name="max_participants"
            type="number"
            min={2}
            max={20}
            value={form.max_participants}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Venue (optional)</label>
        <input
          name="location_name"
          value={form.location_name}
          onChange={handleChange}
          placeholder="Bar El Maño - or leave blank for TBD"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !userCoords}
        className="w-full bg-blue-500 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Creating…' : 'Create Hangout'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your hangout will be visible to people nearby
      </p>
    </form>
  )
}
