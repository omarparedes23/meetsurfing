'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (signUpError) { 
      setError(signUpError.message); 
      setLoading(false); 
      return 
    }

    if (data.user) {
      setShowConfirmation(true)
    }

    setLoading(false)
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400'

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
            <p className="text-gray-500 text-sm mt-2">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-gray-600 text-sm">
              Click the link in the email to activate your account. 
              After confirming, you can <Link href="/login" className="text-blue-500 font-medium hover:underline">sign in</Link>.
            </p>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Didn&apos;t receive the email? Check your spam folder or try registering again.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <input 
            type="email" 
            placeholder="Email" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)} 
            className={inputClass} 
          />
          <input 
            type="password" 
            placeholder="Password (min 8 chars)" 
            required 
            minLength={8} 
            value={password}
            onChange={e => setPassword(e.target.value)} 
            className={inputClass} 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
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
