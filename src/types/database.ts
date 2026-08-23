// database.ts

// =====================================================
// Tipe dasar
// =====================================================

export type CoupleRole = 'bride' | 'groom'

export type WeddingEventType =
  | 'akad'
  | 'reception'
  | 'siraman'
  | 'ngunduh_mantu'
  | 'other'

export type GiftProviderType = 'bank' | 'qris'

// =====================================================
// Tabel: weddings
// =====================================================

export interface Wedding {
  id: string
  wedding_date: string
  timezone: string
  dresscode?: string | null
  quote?: string | null
  opening_text?: string | null
  closing_text?: string | null
  hashtag?: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_couples
// =====================================================

export interface WeddingCouple {
  id: string
  role: CoupleRole
  short_name: string
  full_name: string
  parents?: string | null
  photo_url?: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_events
// =====================================================

export interface WeddingEvent {
  id: string
  event_type: WeddingEventType
  event_date?: string | null
  event_time?: string | null
  location?: string | null
  maps_url?: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_gift_accounts
// =====================================================

export interface WeddingGiftAccount {
  id: string
  provider_type: GiftProviderType
  bank_name?: string | null
  account_number?: string | null
  account_holder_name?: string | null
  qris_url?: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_social_links
// =====================================================

export interface WeddingSocialLink {
  id: string
  platform: string
  username?: string | null
  url?: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_themes
// =====================================================

export interface WeddingTheme {
  id: string
  primary_color: string
  accent_color: string
  text_color: string
  background_color: string
  background_style: string
  font_preset: string
  hero_image_url?: string | null
  cover_background_url?: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_media
// =====================================================

export interface WeddingMedia {
  id: string
  music_url?: string | null
  live_stream_url?: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_seos
// =====================================================

export interface WeddingSeo {
  id: string
  meta_title?: string | null
  meta_description?: string | null
  meta_image_url?: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Tabel: wedding_features
// =====================================================

export interface WeddingFeature {
  id: string
  enable_gallery: boolean
  enable_documentary: boolean
  enable_love_story: boolean
  enable_wishes_wall: boolean
  enable_music: boolean
  created_at: string
  updated_at: string
}

// =====================================================
// WeddingSettings baru
// =====================================================

export interface WeddingSettings {
  wedding: Wedding

  bride: WeddingCouple | null
  groom: WeddingCouple | null

  events: WeddingEvent[]
  gift_accounts: WeddingGiftAccount[]
  social_links: WeddingSocialLink[]

  theme: WeddingTheme | null
  media: WeddingMedia | null
  seo: WeddingSeo | null
  features: WeddingFeature | null
}

// =====================================================
// Data lain
// =====================================================

export interface Guest {
  id: string
  name: string
  code: string
  rsvp_status: 'hadir' | 'tidak_hadir' | null
  rsvp_count: number
  wish?: string
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: string
  image_url: string
  caption?: string
  sort_order: number
}

export interface DocumentaryImage {
  id: string
  image_url: string
  title?: string
  caption?: string
  sort_order: number
}

export interface LoveStory {
  id: string
  title: string
  description?: string
  date?: string
  image_url?: string
  sort_order: number
}