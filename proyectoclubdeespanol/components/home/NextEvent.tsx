'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Ticket, Send, ExternalLink } from 'lucide-react'
import type { Event } from '@/types'
import { formatEventDate, formatEventTime, formatPrice, daysUntilEvent } from '@/lib/utils'
import Image from 'next/image'

interface NextEventProps {
  event: Event
}

export default function NextEvent({ event }: NextEventProps) {
  const daysLeft = daysUntilEvent(event.date)
  const isFriday = event.type === 'friday'
  const isPaid = event.price > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-dark-border"
      style={{
        background: 'linear-gradient(135deg, rgba(18,18,26,0.95) 0%, rgba(26,26,46,0.9) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red" />

      {/* Glow effect */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: isFriday
            ? 'radial-gradient(ellipse, rgba(230,57,70,0.1) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(241,196,15,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cover image */}
          {event.image_url && (
            <div className="lg:w-72 lg:flex-shrink-0">
              <div className="relative h-48 lg:h-full min-h-[180px] rounded-2xl overflow-hidden">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            {/* Type badge + days left */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isFriday
                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                    : 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30'
                  }`}
              >
                {isFriday ? '🎉 Viernes Gratis' : '⭐ Fiesta Especial'}
              </span>
              {daysLeft <= 7 && daysLeft > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/15 text-brand-red border border-brand-red/30">
                  {daysLeft === 1 ? '¡Mañana!' : `En ${daysLeft} días`}
                </span>
              )}
              {daysLeft === 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 animate-pulse">
                  ¡HOY!
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              {event.title}
            </h2>

            {/* Description */}
            {event.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {event.description}
              </p>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-surface2 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha</p>
                  <p className="text-white text-sm font-medium">
                    {formatEventDate(event.date, 'es')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-surface2 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-brand-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Hora</p>
                  <p className="text-white text-sm font-medium">
                    {formatEventTime(event.date)} MSK
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-surface2 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Lugar</p>
                  <p className="text-white text-sm font-medium">{event.location_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-surface2 flex items-center justify-center flex-shrink-0">
                  <Ticket size={14} className="text-brand-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Entrada</p>
                  <p
                    className={`text-sm font-bold ${isPaid ? 'text-brand-gold' : 'text-green-400'}`}
                  >
                    {formatPrice(event.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {isPaid && event.telegram_bot_link ? (
                <a
                  href={event.telegram_bot_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Send size={16} />
                  Comprar entrada (Telegram)
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-green-400 bg-green-500/10 border border-green-500/30">
                  ✓ Entrada libre · Бесплатно
                </span>
              )}
              {event.location_url && (
                <a
                  href={event.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink size={16} />
                  Cómo llegar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
