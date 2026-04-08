'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Ticket, Send, ExternalLink, Star } from 'lucide-react'
import type { Event } from '@/types'
import { formatEventDate, formatEventTime, formatPrice, daysUntilEvent, isUpcoming } from '@/lib/utils'

interface EventCardProps {
  event: Event
  featured?: boolean
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const isFriday = event.type === 'friday'
  const isPaid = event.price > 0
  const upcoming = isUpcoming(event.date)
  const daysLeft = upcoming ? daysUntilEvent(event.date) : -1

  const accentColor = isFriday ? '#E63946' : '#F1C40F'
  const accentBg = isFriday ? 'rgba(230,57,70,0.1)' : 'rgba(241,196,15,0.1)'
  const accentBorder = isFriday ? 'rgba(230,57,70,0.3)' : 'rgba(241,196,15,0.3)'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${featured ? 'md:flex-row' : ''
        }`}
      style={{
        background: 'linear-gradient(135deg, rgba(18,18,26,0.95) 0%, rgba(26,26,46,0.8) 100%)',
        borderColor: 'rgba(42,42,62,0.8)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentBorder
        e.currentTarget.style.boxShadow = `0 20px 60px ${accentBg}, 0 0 0 1px ${accentBorder}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(42,42,62,0.8)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
      />

      {/* Cover image */}
      <div className={`relative overflow-hidden ${featured ? 'md:w-72 md:flex-shrink-0' : ''}`}>
        <div className="relative h-44 w-full">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentBg}, transparent)` }}
            >
              <span className="text-5xl opacity-30">{isFriday ? '🎉' : '⭐'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
            >
              {isFriday ? 'Viernes' : 'Fiesta'}
            </span>
            {!upcoming && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-gray-400 border border-white/10">
                Pasado
              </span>
            )}
          </div>

          {daysLeft === 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse">
                ¡HOY!
              </span>
            </div>
          )}
          {daysLeft > 0 && daysLeft <= 3 && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-red/20 text-brand-red border border-brand-red/40">
                {daysLeft === 1 ? '¡Mañana!' : `${daysLeft} días`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Featured star */}
        {featured && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={13} className="text-brand-gold fill-brand-gold" />
            <span className="text-brand-gold text-xs font-semibold uppercase tracking-wider">
              Evento destacado
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-white mb-2 leading-snug group-hover:text-white transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>
        )}

        {/* Meta details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Calendar size={12} className="text-gray-600 flex-shrink-0" />
            <span>{formatEventDate(event.date, 'es')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Clock size={12} className="text-gray-600 flex-shrink-0" />
            <span>{formatEventTime(event.date)} (московское время)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <MapPin size={12} className="text-gray-600 flex-shrink-0" />
            <span>{event.location_name}</span>
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-dark-border mt-auto">
          <div className="flex items-center gap-1.5">
            <Ticket size={13} className={isPaid ? 'text-brand-gold' : 'text-green-400'} />
            <span
              className={`text-sm font-bold ${isPaid ? 'text-brand-gold' : 'text-green-400'}`}
            >
              {formatPrice(event.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {event.location_url && (
              <a
                href={event.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-dark-border flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-colors"
                aria-label="Cómo llegar"
              >
                <ExternalLink size={13} />
              </a>
            )}
            {isPaid && event.telegram_bot_link ? (
              <a
                href={event.telegram_bot_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 4px 15px ${accentBg}`,
                }}
              >
                <Send size={13} />
                Reservar
              </a>
            ) : (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-green-400 text-sm font-semibold bg-green-500/10 border border-green-500/20">
                ✓ Libre
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
