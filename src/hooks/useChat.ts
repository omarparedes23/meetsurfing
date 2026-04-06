'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, Event, User } from '@/lib/supabase/types'

export function useChat(event: Event | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({})
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const supabase = createClient()

  const enrichMessage = useCallback(async (msg: Message): Promise<Message> => {
    // Fetch sender info
    const { data: sender } = await supabase
      .from('users')
      .select('*')
      .eq('id', msg.sender_id)
      .single()

    if (msg.type === 'image') {
      const { data: photo } = await supabase
        .from('message_photos')
        .select('*')
        .eq('message_id', msg.id)
        .eq('is_deleted', false)
        .single()
      return { ...msg, sender: (sender as User) ?? undefined, photo: photo ?? undefined }
    }

    return { ...msg, sender: (sender as User) ?? undefined }
  }, [supabase])

  const fetchMessages = useCallback(async () => {
    if (!event) return

    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('event_id', event.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (!error && data) {
      const enriched = await Promise.all(data.map(enrichMessage))
      setMessages(enriched)
    }
    setLoading(false)
  }, [event, supabase, enrichMessage])

  useEffect(() => {
    if (!event) return

    fetchMessages()

    // Subscribe to new messages via Realtime
    const channel = supabase
      .channel(`event:${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `event_id=eq.${event.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          if (newMsg.is_deleted) return
          const enriched = await enrichMessage(newMsg)
          setMessages(prev => {
            if (prev.find(m => m.id === enriched.id)) return prev
            return [...prev, enriched]
          })
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string }>()
        const online: Record<string, boolean> = {}
        Object.values(state).flat().forEach(p => {
          online[p.user_id] = true
        })
        setPresenceMap(online)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event, fetchMessages, supabase, enrichMessage])

  const trackPresence = useCallback(async (userId: string) => {
    if (!channelRef.current) return
    await channelRef.current.track({ user_id: userId })
  }, [])

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!event || !content.trim() || event.is_locked) return false
    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSending(false); return false }

    const { error } = await supabase.from('messages').insert({
      event_id: event.id,
      sender_id: user.id,
      type: 'text',
      content: content.trim(),
    })

    setSending(false)
    return !error
  }, [event, supabase])

  const sendImageMessage = useCallback(async (s3Key: string, s3Url: string, meta: {
    size_bytes: number
    mime_type: string
    width?: number
    height?: number
  }): Promise<boolean> => {
    if (!event || event.is_locked) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Insert message first
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        event_id: event.id,
        sender_id: user.id,
        type: 'image',
        content: null,
      })
      .select()
      .single()

    if (msgError || !message) return false

    // Insert photo record
    const { error: photoError } = await supabase.from('message_photos').insert({
      message_id: message.id,
      event_id: event.id,
      uploader_id: user.id,
      s3_key: s3Key,
      s3_url: s3Url,
      ...meta,
    })

    return !photoError
  }, [event, supabase])

  return {
    messages,
    loading,
    sending,
    presenceMap,
    sendMessage,
    sendImageMessage,
    trackPresence,
  }
}
