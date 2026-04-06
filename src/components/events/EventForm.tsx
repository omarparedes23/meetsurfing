'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EventCategory, Coordinates } from '@/lib/supabase/types'
import { CATEGORY_LABELS } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

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
    city: '',
    country: '',
    location_name: '',
    address: '',
    starts_at: '',
    ends_at: '',
    max_participants: 10,
    visibility_radius_km: 30,
    lat: userCoords?.lat ?? 0,
    lng: userCoords?.lng ?? 0,
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
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        creator_id: user.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        city: form.city,
        country: form.country,
        location: `POINT(${form.lng} ${form.lat})`,
        location_name: form.location_name || null,
        address: form.address || null,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        max_participants: form.max_participants,
        visibility_radius_km: form.visibility_radius_km,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Creator joins automatically
    await supabase.from('event_participants').insert({
      event_id: event.id,
      user_id: user.id,
    })

    router.push(`/events/${event.id}`)
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div>
        <label className={labelClass}>Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          maxLength={100}
          placeholder="Cañas en Malasaña esta noche 🍺"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={500}
          rows={3}
          placeholder="Tell people what the plan is…"
          className={inputClass + ' resize-none'}
        />
      </div>

      <div>
        <label className={labelClass}>Category *</label>
        <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>City *</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="Madrid"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            placeholder="Spain"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Venue name</label>
        <input
          name="location_name"
          value={form.location_name}
          onChange={handleChange}
          placeholder="Bar El Maño"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Calle de la Palma 62"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Latitude</label>
          <input
            name="lat"
            type="number"
            step="any"
            value={form.lat}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input
            name="lng"
            type="number"
            step="any"
            value={form.lng}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Starts at *</label>
        <input
          name="starts_at"
          type="datetime-local"
          value={form.starts_at}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Ends at</label>
        <input
          name="ends_at"
          type="datetime-local"
          value={form.ends_at}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Max participants</label>
          <input
            name="max_participants"
            type="number"
            min={2}
            max={50}
            value={form.max_participants}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Visible radius (km)</label>
          <input
            name="visibility_radius_km"
            type="number"
            min={5}
            max={100}
            value={form.visibility_radius_km}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Creating…' : 'Create Hangout'}
      </button>
    </form>
  )
}
