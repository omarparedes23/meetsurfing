'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '', password: '', username: '', full_name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          username: form.username,
          full_name: form.full_name,
        }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Error creating profile')
        setLoading(false)
        return
      }
    }

    router.push('/')
    router.refresh()
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌍</div>
          <h1 className="text-2xl font-bold text-gray-900">Join HangoutSpot</h1>
          <p className="text-gray-500 text-sm mt-1">Meet people spontaneously</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <input type="email" placeholder="Email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />
          <input type="password" placeholder="Password (min 8 chars)" required minLength={8} value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass} />
          <input type="text" placeholder="Username" required value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className={inputClass} />
          <input type="text" placeholder="Full name (optional)" value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className={inputClass} />

          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
