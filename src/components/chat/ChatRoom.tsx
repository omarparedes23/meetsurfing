'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { PhotoUpload } from './PhotoUpload'
import type { Event, User } from '@/lib/supabase/types'
import { Lock, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatRoomProps {
  event: Event
  currentUser: User
}

export function ChatRoom({ event, currentUser }: ChatRoomProps) {
  const { messages, loading, sending, presenceMap, sendMessage, sendImageMessage, trackPresence } =
    useChat(event)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    trackPresence(currentUser.id)
  }, [currentUser.id, trackPresence])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending || event.is_locked) return
    const ok = await sendMessage(input)
    if (ok) setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const onlineCount = Object.keys(presenceMap).length

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
        <div>
          <h2 className="font-semibold text-gray-900 truncate max-w-[200px]">{event.title}</h2>
          <p className="text-xs text-gray-500">
            {onlineCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                {onlineCount} online
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {event.current_participants}/{event.max_participants}
        </div>
      </div>

      {/* Locked banner */}
      {event.is_locked && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Chat closed — photos have been deleted due to{' '}
            {event.lock_reason === 'inactivity' ? '2 hours of inactivity' : event.lock_reason}.
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">👋</p>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUser.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!event.is_locked && (
        <div className="border-t px-4 py-3 bg-white flex items-center gap-2">
          <PhotoUpload
            event={event}
            onUploaded={sendImageMessage}
            disabled={sending}
          />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
            maxLength={1000}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              input.trim() && !sending
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
