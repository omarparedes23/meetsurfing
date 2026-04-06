'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Message } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  const senderName = message.sender?.full_name ?? message.sender?.username ?? 'Unknown'
  const avatarUrl = message.sender?.avatar_url

  return (
    <>
      <div className={cn('flex gap-2 max-w-[85%]', isOwn ? 'ml-auto flex-row-reverse' : '')}>
        {/* Avatar */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden self-end">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={senderName} width={32} height={32} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
              {senderName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
          {!isOwn && (
            <span className="text-xs text-gray-500 px-1">{senderName}</span>
          )}

          {/* Content */}
          {message.type === 'text' ? (
            <div
              className={cn(
                'rounded-2xl px-4 py-2 text-sm break-words',
                isOwn
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              )}
            >
              {message.content}
            </div>
          ) : message.type === 'image' && message.photo ? (
            <button
              onClick={() => setLightboxOpen(true)}
              className="rounded-2xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
            >
              <Image
                src={message.photo.s3_url}
                alt="Photo"
                width={200}
                height={200}
                className="object-cover max-h-48"
                unoptimized
              />
            </button>
          ) : null}

          <span className="text-[10px] text-gray-400 px-1">
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && message.photo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <Image
            src={message.photo.s3_url}
            alt="Photo"
            width={message.photo.width ?? 800}
            height={message.photo.height ?? 600}
            className="max-w-full max-h-full object-contain rounded-lg"
            unoptimized
          />
        </div>
      )}
    </>
  )
}
