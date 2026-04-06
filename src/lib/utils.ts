import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = then.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 0) return 'Started'
  if (diffMins < 60) return `in ${diffMins}m`
  const hours = Math.floor(diffMins / 60)
  if (hours < 24) return `in ${hours}h`
  return `in ${Math.floor(hours / 24)}d`
}

export const CATEGORY_LABELS: Record<string, string> = {
  bar: '🍺 Bar',
  cafe: '☕ Café',
  restaurant: '🍽️ Restaurant',
  park: '🌳 Park',
  museum: '🏛️ Museum',
  sports: '⚽ Sports',
  music: '🎵 Music',
  other: '📍 Other',
}

export const CATEGORY_COLORS: Record<string, string> = {
  bar: '#f59e0b',
  cafe: '#6b7280',
  restaurant: '#ef4444',
  park: '#22c55e',
  museum: '#8b5cf6',
  sports: '#3b82f6',
  music: '#ec4899',
  other: '#64748b',
}
