export type EventType = 'friday' | 'party'

export interface Event {
  id: string
  title: string
  description: string
  date: string // ISO timestamp
  location_name: string
  location_url: string
  type: EventType
  price: number
  telegram_bot_link: string | null
  image_url: string | null
  created_at: string
}

export interface GalleryImage {
  id: string
  event_id: string | null
  image_url: string
  caption: string | null
  created_at: string
}

export interface LiveStatusInfo {
  isLive: boolean
  moscowTime: Date
  dayOfWeek: number // 0=Sun, 5=Fri
  hour: number
}
