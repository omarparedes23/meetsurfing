'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom } from '@/components/chat/ChatRoom'
import type { Event, User } from '@/lib/supabase/types'
import { CATEGORY_LABELS, formatRelativeTime } from '@/lib/utils'
import { ArrowLeft, Users, MapPin, Clock, Lock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  event: Event
  currentUser: User
  isParticipant: boolean
}

export function EventDetailClient({ event: initialEvent, currentUser, isParticipant: initialParticipant }: Props) {
  const router = useRouter()
  const [event] = useState(initialEvent)
  const [isParticipant, setIsParticipant] = useState(initialParticipant)
  const [joining, setJoining] = useState(false)
  const [tab, setTab] = useState<'info' | 'chat'>('info')

  const handleJoin = async () => {
    setJoining(true)
    const supabase = createClient()

    const { error } = await supabase.from('event_participants').upsert({
      event_id: event.id,
      user_id: currentUser.id,
      status: 'joined',
    })

    if (!error) setIsParticipant(true)
    setJoining(false)
  }

  const handleLeave = async () => {
    const supabase = createClient()
    await supabase
      .from('event_participants')
      .update({ status: 'left', left_at: new Date().toISOString() })
      .eq('event_id', event.id)
      .eq('user_id', currentUser.id)
    setIsParticipant(false)
  }

  const isFull = event.current_participants >= event.max_participants && !isParticipant

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-57px)]">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{event.title}</h1>
          <p className="text-xs text-gray-500">{CATEGORY_LABELS[event.category]}</p>
        </div>
        {event.is_locked && <Lock className="w-4 h-4 text-amber-500" />}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b">
        {(['info', 'chat'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
              tab === t ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'info' ? (
          <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
            {event.description && (
              <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                {event.current_participants}/{event.max_participants} participants
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location_name}{event.address ? ` · ${event.address}` : ''}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                {format(new Date(event.starts_at), 'PPp')} ({formatRelativeTime(event.starts_at)})
              </div>
            </div>

            {/* Join/Leave */}
            {!event.is_locked && (
              <div className="pt-2">
                {isParticipant ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTab('chat')}
                      className="flex-1 bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-600 transition-colors"
                    >
                      Open Chat
                    </button>
                    <button
                      onClick={handleLeave}
                      className="px-4 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Leave
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joining || isFull}
                    className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isFull ? 'Event is full' : joining ? 'Joining…' : 'Join Hangout'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : isParticipant ? (
          <ChatRoom event={event} currentUser={currentUser} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <span className="text-4xl">💬</span>
            <p className="text-sm">Join the hangout to chat</p>
          </div>
        )}
      </div>
    </div>
  )
}
