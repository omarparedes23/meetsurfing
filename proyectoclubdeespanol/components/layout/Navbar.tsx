'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Music2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLiveStatus } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Inicio', labelRu: 'Главная' },
  { href: '/events', label: 'Eventos', labelRu: 'События' },
  { href: '/gallery', label: 'Galería', labelRu: 'Галерея' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const { isLive: live } = getLiveStatus()
    setIsLive(live)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center shadow-lg shadow-brand-red/30 group-hover:shadow-brand-red/50 transition-shadow">
                <Music2 size={18} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-white text-sm">
                  Spanish Club
                </span>
                <span className="text-brand-gold text-xs font-medium tracking-wide">
                  Moscow
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 bg-dark-surface2 rounded-lg border border-dark-border"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    <span className="relative z-10 text-gray-600 text-xs ml-1">
                      {link.labelRu}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Live pill */}
              {isLive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold"
                >
                  <span className="live-dot" />
                  EN VIVO
                </motion.div>
              )}

              {/* Telegram CTA */}
              <a
                href="https://t.me/clubdeespanolenmoscu"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red text-white text-sm font-semibold hover:bg-brand-red-dark transition-all duration-200 shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40"
              >
                Únete
              </a>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 rounded-lg bg-dark-surface flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-dark-border"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="mx-4 mt-2 glass-card rounded-2xl overflow-hidden shadow-2xl">
              <nav className="p-3 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-dark-surface2 text-white border border-brand-red/30'
                          : 'text-gray-400 hover:text-white hover:bg-dark-surface2'
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="text-gray-600 text-xs">{link.labelRu}</span>
                    </Link>
                  )
                })}
                <div className="pt-2 border-t border-dark-border mt-1">
                  <a
                    href="https://t.me/clubdeespanolenmoscu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center text-sm"
                  >
                    Únete al club · Вступить
                  </a>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
