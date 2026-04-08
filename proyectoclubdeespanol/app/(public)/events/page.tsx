import type { Metadata } from 'next'
import { getUpcomingEvents, getPastEvents } from '@/lib/supabase'
import EventCard from '@/components/events/EventCard'
import { Calendar, Star, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Eventos | Spanish Club Moscow',
  description:
    'Próximos eventos del Spanish Club Moscow. Reuniones gratuitas los viernes en Casa Agave y fiestas especiales en discotecas de Moscú. • Предстоящие мероприятия клуба испанского языка в Москве.',
  openGraph: {
    title: 'Eventos | Spanish Club Moscow',
    description: 'Reuniones gratis los viernes + Fiestas especiales de pago.',
  },
}

export const revalidate = 300

export default async function EventsPage() {
  const allUpcoming = await getUpcomingEvents()
  const pastEvents = await getPastEvents()

  const fridayEvents = allUpcoming.filter((e) => e.type === 'friday')
  const partyEvents = allUpcoming.filter((e) => e.type === 'party')

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Page header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-sm font-medium mb-6">
            <Calendar size={14} />
            Agenda · Расписание
          </span>
          <h1 className="section-title text-4xl md:text-5xl mb-4">
            Próximos{' '}
            <span className="gradient-text">Eventos</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-balance">
            Viernes gratis en Casa Agave + Fiestas especiales en los mejores venues de Moscú.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Бесплатные пятницы в Casa Agave + Особые вечеринки в лучших заведениях Москвы.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20">

        {/* Friday Events */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center">
                <Calendar size={18} className="text-brand-red" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  Viernes en Casa Agave
                </h2>
                <p className="text-gray-500 text-sm">Пятницы в Casa Agave · Gratis · Бесплатно</p>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-brand-red/30 to-transparent" />
            <span className="text-green-400 text-sm font-semibold px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              Entrada libre
            </span>
          </div>

          {fridayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fridayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar size={28} className="text-gray-600" />}
              title="Sin eventos próximos"
              subtitle="Pronto publicaremos los próximos viernes. ¡Únete a Telegram para avisos!"
            />
          )}
        </section>

        {/* Party Events */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                <Star size={18} className="text-brand-gold" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  Fiestas Especiales
                </h2>
                <p className="text-gray-500 text-sm">Особые вечеринки · Eventos premium de pago</p>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-brand-gold/30 to-transparent" />
            <span className="text-brand-gold text-sm font-semibold px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20">
              Pago vía Telegram
            </span>
          </div>

          {partyEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partyEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Star size={28} className="text-gray-600" />}
              title="Próximamente"
              subtitle="Las fiestas especiales se anuncian en nuestro canal de Telegram. ¡Síguenos!"
            />
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <Clock size={18} className="text-gray-500" />
                </div>
                <div>
                  <h2 className="text-gray-400 font-bold text-xl">
                    Eventos Pasados
                  </h2>
                  <p className="text-gray-600 text-sm">Прошедшие мероприятия</p>
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-700/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="glass-card rounded-2xl p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-dark-surface2 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-white font-medium mb-2">{title}</p>
      <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">{subtitle}</p>
      <a
        href="https://t.me/clubdeespanolenmoscu"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-sm inline-flex"
      >
        Unirse al canal de Telegram
      </a>
    </div>
  )
}
