'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '', bio: '', age: '', city: '', country: '',
    languages: '', avatar_url: '', location_sharing: 'approximate',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users').select('*').eq('id', user.id).single()

      if (profile) {
        setForm({
          full_name: profile.full_name ?? '',
          bio: profile.bio ?? '',
          age: profile.age?.toString() ?? '',
          city: profile.city ?? '',
          country: profile.country ?? '',
          languages: (profile.languages ?? []).join(', '),
          avatar_url: profile.avatar_url ?? '',
          location_sharing: profile.location_sharing ?? 'approximate',
        })
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const langs = form.languages
      .split(',')
      .map(l => l.trim())
      .filter(Boolean)

    const { error: updateError } = await supabase.from('users').update({
      full_name: form.full_name || null,
      bio: form.bio || null,
      age: form.age ? parseInt(form.age) : null,
      city: form.city || null,
      country: form.country || null,
      languages: langs.length > 0 ? langs : null,
      avatar_url: form.avatar_url || null,
      location_sharing: form.location_sharing,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (updateError) setError(updateError.message)
    else router.back()

    setSaving(false)
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        <div>
          <label className={labelClass}>Full name</label>
          <input className={inputClass} value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Bio</label>
          <textarea className={inputClass + ' resize-none'} rows={3} value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} maxLength={500} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Age</label>
            <input className={inputClass} type="number" min={18} max={99} value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Location sharing</label>
            <select className={inputClass} value={form.location_sharing}
              onChange={e => setForm(f => ({ ...f, location_sharing: e.target.value }))}>
              <option value="exact">Exact</option>
              <option value="approximate">Approximate</option>
              <option value="city_only">City only</option>
              <option value="off">Off</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input className={inputClass} value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Languages (comma separated)</label>
          <input className={inputClass} value={form.languages} placeholder="English, Spanish, French"
            onChange={e => setForm(f => ({ ...f, languages: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Avatar URL</label>
          <input className={inputClass} type="url" value={form.avatar_url}
            onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} />
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  )
}
