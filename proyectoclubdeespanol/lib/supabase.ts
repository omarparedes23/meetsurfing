import { createClient } from '@supabase/supabase-js'
import type { Event, GalleryImage } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Events ---

export async function getUpcomingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
  return data ?? []
}

export async function getNextEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching next event:', error)
    return null
  }
  return data
}

export async function getEventsByType(type: 'friday' | 'party'): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', type)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })

  if (error) {
    console.error(`Error fetching ${type} events:`, error)
    return []
  }
  return data ?? []
}

export async function getPastEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('date', new Date().toISOString())
    .order('date', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching past events:', error)
    return []
  }
  return data ?? []
}

// --- Gallery ---

export async function getGalleryImages(limit = 24): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching gallery images:', error)
    return []
  }
  return data ?? []
}

export async function getEventGallery(eventId: string): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching event gallery:', error)
    return []
  }
  return data ?? []
}

// --- Storage URL helper ---

export function getPublicImageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
