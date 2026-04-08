'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/supabase/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils'
import { MapPin, Users, MessageCircle, Plus, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export default function MyEventsPage() {
  const router = useRouter()
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    setLoading(true)
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch events created by user
    const { data: created } = await supabase
      .from('cs_events')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    // Fetch events user joined
    const { data: participations } = await supabase
      .from('cs_event_participants')
      .select('event_id')
      .eq('user_id', user.id)
      .eq('status', 'joined')

    let joined: Event[] = []
    if (participations && participations.length > 0) {
      const eventIds = participations.map(p => p.event_id)
      const { data: events } = await supabase
        .from('cs_events')
        .select('*')
        .in('id', eventIds)
        .neq('creator_id', user.id) // Exclude events created by user
        .order('starts_at', { ascending: true })
      
      joined = events || []
    }

    setCreatedEvents(created || [])
    setJoinedEvents(joined)
    setLoading(false)
  }

  const EventCard = ({ event, isCreator }: { event: Event; isCreator: boolean }) => {
    const color = CATEGORY_COLORS[event.category] ?? '#64748b'
    const isFull = event.current_participants >= event.max_participants

    return (
      <div
        onClick={() => router.push(`/events/${event.id}`)}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Category icon */}
            <div
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${color}20` }}
            >
              {CATEGORY_LABELS[event.category]?.split(' ')[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                {isCreator && (
                  <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                    Creator
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{event.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location_name || 'Location TBD'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.current_participants}/{event.max_participants}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {isFull ? 'Full' : 'Open'}
                </span>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Created {format(new Date(event.created_at), 'MMM d, h:mm a')}
              </div>
            </div>

            {/* Chat button hint */}
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-blue-500">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const totalEvents = createdEvents.length + joinedEvents.length

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Hangouts</h1>
        <button
          onClick={() => router.push('/events/new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {totalEvents === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌇</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No hangouts yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Create your first hangout or join one nearby
          </p>
          <button
            onClick={() => router.push('/events/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Create Hangout
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Created Events */}
          {createdEvents.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Created by you ({createdEvents.length})
              </h2>
              <div className="space-y-3">
                {createdEvents.map(event => (
                  <EventCard key={event.id} event={event} isCreator={true} />
                ))}
              </div>
            </section>
          )}

          {/* Joined Events */}
          {joinedEvents.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                You joined ({joinedEvents.length})
              </h2>
              <div className="space-y-3">
                {joinedEvents.map(event => (
                  <EventCard key={event.id} event={event} isCreator={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click on any hangout to open the chat and see who's coming!
        </p>
      </div>
    </div>
  )
}
