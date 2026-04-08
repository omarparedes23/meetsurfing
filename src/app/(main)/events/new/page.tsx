'use client'

import { EventForm } from '@/components/events/EventForm'
import { useLocation } from '@/hooks/useLocation'
import { ArrowLeft, Loader2, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewEventPage() {
  const router = useRouter()
  const { coords, loading, error, permissionDenied, requestLocation } = useLocation()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Hangout</h1>
      
      {/* Location loading state */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm text-blue-700">Getting your location...</span>
        </div>
      )}
      
      {/* Location error */}
      {(error || permissionDenied) && !coords && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Location access required</p>
              <p className="text-xs text-red-600 mt-1">
                {permissionDenied 
                  ? 'Please enable location access in your browser settings and try again.'
                  : error}
              </p>
              <button 
                onClick={requestLocation}
                className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <EventForm userCoords={coords} />
    </div>
  )
}
