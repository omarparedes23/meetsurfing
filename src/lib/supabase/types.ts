export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not'
export type LocationSharing = 'exact' | 'approximate' | 'city_only' | 'off'
export type EventCategory = 'bar' | 'cafe' | 'restaurant' | 'park' | 'museum' | 'sports' | 'music' | 'other'
export type EventStatus = 'active' | 'full' | 'cancelled' | 'expired'
export type LockReason = 'inactivity' | 'manual' | 'reported'
export type ParticipantStatus = 'joined' | 'left' | 'kicked' | 'banned'
export type MessageType = 'text' | 'image' | 'system'
export type ReportReason = 'spam' | 'harassment' | 'fake_profile' | 'inappropriate_content' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface User {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  age: number | null
  gender: Gender | null
  languages: string[] | null
  city: string | null
  country: string | null
  location_sharing: LocationSharing
  location_updated_at: string | null
  is_online: boolean
  last_seen_at: string | null
  is_verified: boolean
  is_banned: boolean
  avg_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  creator_id: string
  title: string
  description: string | null
  category: EventCategory
  city: string
  country: string
  location_name: string | null
  address: string | null
  visibility_radius_km: number
  starts_at: string
  ends_at: string | null
  max_participants: number
  current_participants: number
  status: EventStatus
  is_locked: boolean
  locked_at: string | null
  lock_reason: LockReason | null
  last_activity_at: string
  location_hidden: boolean
  created_at: string
  updated_at: string
}

export interface NearbyEvent extends Omit<Event, 'creator_id'> {
  distance_km: number
  creator_id: string
  creator_username: string
  creator_avatar_url: string | null
  creator_avg_rating: number
  lat?: number
  lng?: number
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  status: ParticipantStatus
  joined_at: string
  left_at: string | null
}

export interface Message {
  id: string
  event_id: string
  sender_id: string
  type: MessageType
  content: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  sender?: User
  photo?: MessagePhoto
}

export interface MessagePhoto {
  id: string
  message_id: string
  event_id: string
  uploader_id: string
  s3_key: string
  s3_url: string
  size_bytes: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
}

export interface UserReview {
  id: string
  reviewer_id: string
  reviewed_id: string
  event_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface UserReport {
  id: string
  reporter_id: string
  reported_id: string
  event_id: string | null
  message_id: string | null
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface PresignResponse {
  url: string
  fields?: Record<string, string>
  s3Key: string
  s3Url: string
}
