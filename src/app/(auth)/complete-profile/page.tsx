'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User } from 'lucide-react'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    // Verify user is authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('cs_users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        // Profile already exists, redirect to home
        router.push('/')
        return
      }

      setChecking(false)
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      setError('Session expired. Please log in again.')
      setLoading(false)
      return
    }

    // Insert profile
    const { error: insertError } = await supabase
      .from('cs_users')
      .insert({
        id: session.user.id,
        username: username.toLowerCase().trim(),
        full_name: fullName.trim() || null,
      })

    if (insertError) {
      if (insertError.message.includes('duplicate key')) {
        setError('Username already taken. Please choose another.')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    // Profile created successfully
    router.push('/')
    router.refresh()
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-500 mt-2">Checking your account...</p>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm mt-2">
            Almost there! Just a few more details to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input 
              type="text" 
              placeholder="Choose a unique username" 
              required 
              minLength={3}
              value={username}
              onChange={e => setUsername(e.target.value)} 
              className={inputClass} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="Your full name (optional)" 
              value={fullName}
              onChange={e => setFullName(e.target.value)} 
              className={inputClass} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  )
}
