'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ExternalLink, X } from 'lucide-react'
import { getLiveStatus } from '@/lib/utils'

export default function LiveStatus() {
  const [isLive, setIsLive] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const { isLive: live } = getLiveStatus()
    setIsLive(live)

    // Re-check every minute
    const interval = setInterval(() => {
      const { isLive: updatedLive } = getLiveStatus()
      setIsLive(updatedLive)
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  // Don't render on server or if dismissed
  if (!mounted || !isLive || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed top-16 md:top-20 left-0 right-0 z-40"
      >
        <div className="mx-3 md:mx-auto md:max-w-2xl mt-2">
          <div
            className="relative overflow-hidden rounded-2xl border border-green-500/40 shadow-2xl shadow-green-500/20"
            style={{
              background:
                'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(21,128,61,0.1) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Animated glow border */}
            <div className="absolute inset-0 rounded-2xl border border-green-400/20 animate-pulse-slow pointer-events-none" />

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Pulse dot */}
              <div className="flex-shrink-0">
                <span className="live-dot" />
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-green-300 font-semibold text-sm leading-tight">
                  ¡Estamos en Casa Agave{' '}
                  <span className="text-white font-bold">AHORA</span>!
                  {' '}Únete a la charla 🎉
                </p>
                <p className="text-green-500/70 text-xs mt-0.5">
                  Сейчас идёт встреча в Casa Agave · Приходи!
                </p>
              </div>

              {/* Maps links */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="https://yandex.ru/maps/?text=Casa+Agave+Москва"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-medium hover:bg-green-500/30 transition-colors"
                  aria-label="Abrir en Yandex Maps"
                >
                  <MapPin size={12} />
                  Yandex Maps
                </a>
                <a
                  href="https://maps.google.com/?q=Casa+Agave+Moscow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-medium hover:bg-green-500/30 transition-colors"
                  aria-label="Abrir en Google Maps"
                >
                  <ExternalLink size={12} />
                  <span className="hidden sm:inline">Google Maps</span>
                  <span className="sm:hidden">Maps</span>
                </a>
                <button
                  onClick={() => setDismissed(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-green-500/60 hover:text-green-300 hover:bg-green-500/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
