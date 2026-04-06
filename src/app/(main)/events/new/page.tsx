'use client'

import { EventForm } from '@/components/events/EventForm'
import { useLocation } from '@/hooks/useLocation'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewEventPage() {
  const router = useRouter()
  const { coords } = useLocation()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Hangout</h1>
      <EventForm userCoords={coords} />
    </div>
  )
}
