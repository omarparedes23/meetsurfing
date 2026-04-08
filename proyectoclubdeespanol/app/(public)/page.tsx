import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import NextEvent from '@/components/home/NextEvent'
import LiveStatus from '@/components/shared/LiveStatus'
import { getNextEvent, getUpcomingEvents } from '@/lib/supabase'
import EventCard from '@/components/events/EventCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Inicio | Spanish Club Moscow',
}

// Revalidate every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  const [nextEvent, upcomingEvents] = await Promise.all([
    getNextEvent(),
    getUpcomingEvents(),
  ])

  const previewEvents = upcomingEvents.slice(0, 3)

  return (
    <>
      <LiveStatus />
      <Hero />

      {/* Next Event Highlight */}
      {nextEvent && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-red/50" />
              <span className="text-brand-red font-semibold text-sm uppercase tracking-widest">
                Próximo evento
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-red/50" />
            </div>
            <NextEvent event={nextEvent} />
          </div>
        </section>
      )}

      {/* Events Preview */}
      {previewEvents.length > 0 && (
        <section className="py-16 px-4 bg-dark-surface">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="section-title">
                <span className="accent-underline">Eventos</span>
              </h2>
              <Link
                href="/events"
                className="flex items-center gap-2 text-brand-red hover:text-brand-gold transition-colors text-sm font-medium"
              >
                Ver todos <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-6">
            ¿Qué es el{' '}
            <span className="gradient-text">Spanish Club Moscow?</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-4 text-balance">
            Somos una comunidad viva donde latinos y rusos se encuentran para practicar español,
            compartir cultura y hacer amigos. Cada viernes en{' '}
            <span className="text-white font-medium">Casa Agave</span> — charla libre, música y
            buena vibra. Sin costo, sin barreras.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-10 text-balance">
            Мы — живое сообщество, где латиноамериканцы и русские встречаются, чтобы практиковать
            испанский, делиться культурой и заводить друзей. Каждую пятницу в Casa Agave — свободное
            общение, музыка и хорошая атмосфера. Бесплатно.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { label: 'Viernes libres', sublabel: 'Каждую пятницу', value: '+ de 50', icon: '🎉' },
              { label: 'Comunidad', sublabel: 'Сообщество', value: '200+', icon: '🌎' },
              { label: 'Idiomas', sublabel: 'Языков', value: '5+', icon: '🗣️' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-white font-medium">{stat.label}</div>
                <div className="text-gray-500 text-sm">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 px-4 bg-dark-surface">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-gold/50" />
            <span className="text-brand-gold font-semibold text-sm uppercase tracking-widest">
              Dónde nos reunimos
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-gold/50" />
          </div>
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Casa Agave
                </h3>
                <p className="text-gray-400 mb-1">Restaurante mexicano — Москва</p>
                <p className="text-gray-500 text-sm mb-6">
                  Charla en el salón principal · Fiesta en el sótano
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://yandex.ru/maps/?text=Casa+Agave+Москва"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm"
                  >
                    Yandex Maps
                  </a>
                  <a
                    href="https://maps.google.com/?q=Casa+Agave+Moscow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm"
                  >
                    Google Maps
                  </a>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-red text-xs font-bold">V</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Viernes · Пятница</p>
                    <p className="text-gray-400 text-sm">19:00 → madrugada · до утра</p>
                    <p className="text-green-400 text-sm font-medium">Entrada libre · Бесплатно</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-gold text-xs font-bold">★</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Fiestas especiales · Вечеринки</p>
                    <p className="text-gray-400 text-sm">Locaciones VIP en Moscú</p>
                    <p className="text-brand-gold text-sm font-medium">Ver precio en cada evento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
