'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom } from '@/components/chat/ChatRoom'
import type { Event, User } from '@/lib/supabase/types'
import { CATEGORY_LABELS, formatRelativeTime } from '@/lib/utils'
import { ArrowLeft, Users, MapPin, Clock, Lock, Loader2, Check, X } from 'lucide-react'
import { format } from 'date-fns'

interface PendingRequest {
  id: string
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

interface Props {
  event: Event
  currentUser: User
  isParticipant: boolean
  participantStatus: string | null
}

export function EventDetailClient({ event: initialEvent, currentUser, isParticipant: initialParticipant, participantStatus: initialStatus }: Props) {
  const router = useRouter()
  const [event] = useState(initialEvent)
  const [isParticipant, setIsParticipant] = useState(initialParticipant)
  const [participantStatus, setParticipantStatus] = useState<string | null>(initialStatus)
  const [joining, setJoining] = useState(false)
  const [tab, setTab] = useState<'info' | 'chat'>('info')
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  const isCreator = event.creator_id === currentUser.id
  const isFull = event.current_participants >= event.max_participants && !isParticipant

  // Requester: watch own participant record for approval
  useEffect(() => {
    if (isCreator || participantStatus !== 'pending') return
    const supabase = createClient()
    const channel = supabase
      .channel(`my-request-${event.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'cs_event_participants',
        filter: `event_id=eq.${event.id}`,
      }, (payload) => {
        if (payload.new.user_id !== currentUser.id) return
        if (payload.new.status === 'joined') {
          setIsParticipant(true)
          setParticipantStatus('joined')
          setTab('chat')
        } else if (payload.new.status === 'left') {
          setParticipantStatus(null)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isCreator, participantStatus, event.id, currentUser.id])

  // Creator: watch pending requests
  useEffect(() => {
    if (!isCreator) return
    fetchPendingRequests()

    const supabase = createClient()
    const channel = supabase
      .channel(`pending-${event.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cs_event_participants',
        filter: `event_id=eq.${event.id}`,
      }, () => fetchPendingRequests())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isCreator, event.id])

  const fetchPendingRequests = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('cs_event_participants')
      .select('id, user_id, cs_users(username, full_name, avatar_url)')
      .eq('event_id', event.id)
      .eq('status', 'pending')

    setPendingRequests(
      (data ?? []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        username: r.cs_users?.username ?? 'Unknown',
        full_name: r.cs_users?.full_name ?? null,
        avatar_url: r.cs_users?.avatar_url ?? null,
      }))
    )
  }

  const handleJoin = async () => {
    setJoining(true)
    const supabase = createClient()
    const { error } = await supabase.from('cs_event_participants').upsert({
      event_id: event.id,
      user_id: currentUser.id,
      status: 'pending',
    })
    if (!error) setParticipantStatus('pending')
    setJoining(false)
  }

  const handleLeave = async () => {
    const supabase = createClient()
    await supabase
      .from('cs_event_participants')
      .update({ status: 'left', left_at: new Date().toISOString() })
      .eq('event_id', event.id)
      .eq('user_id', currentUser.id)
    setIsParticipant(false)
    setParticipantStatus(null)
  }

  const handleApprove = async (participantId: string) => {
    setProcessingId(participantId)
    const supabase = createClient()
    await supabase
      .from('cs_event_participants')
      .update({ status: 'joined', joined_at: new Date().toISOString() })
      .eq('id', participantId)
    await fetchPendingRequests()
    setProcessingId(null)
  }

  const handleReject = async (participantId: string) => {
    setProcessingId(participantId)
    const supabase = createClient()
    await supabase
      .from('cs_event_participants')
      .update({ status: 'left' })
      .eq('id', participantId)
    await fetchPendingRequests()
    setProcessingId(null)
  }

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
            {t === 'info' && isCreator && pendingRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] bg-red-500 text-white rounded-full">
                {pendingRequests.length}
              </span>
            )}
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

            {/* Pending requests (creator only) */}
            {isCreator && pendingRequests.length > 0 && (
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Join Requests ({pendingRequests.length})
                </p>
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                      {req.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {req.full_name || req.username}
                      </p>
                      <p className="text-xs text-gray-500">@{req.username}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId === req.id}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 transition-colors"
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={processingId === req.id}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                ) : participantStatus === 'pending' ? (
                  <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 rounded-xl py-3 text-sm font-medium text-center">
                    ⏳ Waiting for approval…
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joining || isFull}
                    className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isFull ? 'Event is full' : joining ? 'Sending request…' : 'Request to Join'}
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
            <p className="text-sm">
              {participantStatus === 'pending' ? 'Waiting for approval to join the chat' : 'Join the hangout to chat'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
