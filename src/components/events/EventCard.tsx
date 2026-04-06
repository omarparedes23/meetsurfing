'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users, MapPin, Star, Clock } from 'lucide-react'
import type { NearbyEvent } from '@/lib/supabase/types'
import { CATEGORY_LABELS, CATEGORY_COLORS, formatDistance, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: NearbyEvent
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  const router = useRouter()
  const color = CATEGORY_COLORS[event.category] ?? '#64748b'
  const isFull = event.current_participants >= event.max_participants

  return (
    <button
      onClick={() => router.push(`/events/${event.id}`)}
      className={cn(
        'w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Category badge */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${color}20` }}
        >
          {CATEGORY_LABELS[event.category]?.split(' ')[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <span
              className={cn(
                'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full',
                isFull
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-700'
              )}
            >
              {isFull ? 'Full' : 'Open'}
            </span>
          </div>

          {event.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {formatDistance(event.distance_km)}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              {event.current_participants}/{event.max_participants}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(event.starts_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
          {event.creator_avatar_url ? (
            <Image
              src={event.creator_avatar_url}
              alt={event.creator_username}
              width={24}
              height={24}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
              {event.creator_username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-600">{event.creator_username}</span>
        {event.creator_avg_rating > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-amber-500 ml-auto">
            <Star className="w-3 h-3 fill-amber-400" />
            {event.creator_avg_rating.toFixed(1)}
          </span>
        )}
      </div>
    </button>
  )
}
