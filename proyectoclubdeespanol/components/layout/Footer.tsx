import Link from 'next/link'
import { Send, Instagram, Music2, MapPin, Clock } from 'lucide-react'

const socialLinks = [
  {
    label: 'Telegram',
    href: 'https://t.me/clubdeespanolenmoscu',
    icon: Send,
    color: 'hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/10',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/clubdeespanolenmoscu',
    icon: Instagram,
    color: 'hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/10',
  },
]

const quickLinks = [
  { href: '/', label: 'Inicio · Главная' },
  { href: '/events', label: 'Eventos · События' },
  { href: '/gallery', label: 'Galería · Галерея' },
]

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center">
                <Music2 size={18} className="text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-white block text-sm">Spanish Club</span>
                <span className="text-brand-gold text-xs font-medium">Moscow</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-2">
              Comunidad de intercambio cultural latino-ruso. Viernes en Casa Agave y fiestas
              especiales en Moscú.
            </p>
            <p className="text-gray-600 text-xs leading-relaxed max-w-xs">
              Латино-русское культурное сообщество Москвы.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-10 h-10 rounded-xl border border-dark-border bg-dark-bg flex items-center justify-center text-gray-500 transition-all duration-200 ${s.color}`}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Dónde & Cuándo
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-brand-red mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Casa Agave</p>
                  <p className="text-gray-500 text-xs">Москва · Moscow</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={15} className="text-brand-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Viernes · Пятница</p>
                  <p className="text-gray-500 text-xs">19:00 MSK · Gratis · Бесплатно</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Spanish Club Moscow. Todos los derechos reservados.
          </p>
          <p className="text-gray-700 text-xs">
            Hecho con ❤️ en Moscú · Сделано с любовью в Москве
          </p>
        </div>
      </div>
    </footer>
  )
}
