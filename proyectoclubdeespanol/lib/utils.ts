import type { LiveStatusInfo } from '@/types'

// Moscow is UTC+3 (no DST)
const MOSCOW_OFFSET_HOURS = 3

export function getMoscowTime(): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  return new Date(utc + MOSCOW_OFFSET_HOURS * 3_600_000)
}

export function getLiveStatus(): LiveStatusInfo {
  const moscowTime = getMoscowTime()
  const dayOfWeek = moscowTime.getDay() // 0=Sun, 5=Fri
  const hour = moscowTime.getHours()

  // Live on Fridays from 19:00 to 23:59 Moscow time
  const isFriday = dayOfWeek === 5
  const isEventHour = hour >= 19 // 19:00 → 23:59

  return {
    isLive: isFriday && isEventHour,
    moscowTime,
    dayOfWeek,
    hour,
  }
}

export function formatEventDate(dateStr: string, locale: 'es' | 'ru' | 'en' = 'es'): string {
  const date = new Date(dateStr)

  const localeMap = {
    es: 'es-ES',
    ru: 'ru-RU',
    en: 'en-US',
  }

  return date.toLocaleDateString(localeMap[locale], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis / Бесплатно'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) > new Date()
}

export function daysUntilEvent(dateStr: string): number {
  const event = new Date(dateStr)
  const now = new Date()
  const diff = event.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
