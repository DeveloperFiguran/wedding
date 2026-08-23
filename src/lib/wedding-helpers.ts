// src/lib/wedding-helpers.ts

import {
  WeddingSettings,
  Wedding,
  WeddingCouple,
  WeddingEvent,
  WeddingGiftAccount,
  WeddingSocialLink,
  WeddingTheme,
  WeddingMedia,
  WeddingSeo,
  WeddingEventType,
} from '@/types/database'

// =====================================================
// Type khusus untuk feature flags
// =====================================================
export type WeddingFeatureFlag =
  | 'enable_gallery'
  | 'enable_documentary'
  | 'enable_love_story'
  | 'enable_wishes_wall'
  | 'enable_music'

// =====================================================
// Safe accessors dengan fallback
// =====================================================

export function getWedding(settings: WeddingSettings | null): Wedding | null {
  return settings?.wedding ?? null
}

export function getBride(settings: WeddingSettings | null): WeddingCouple | null {
  return settings?.bride ?? null
}

export function getGroom(settings: WeddingSettings | null): WeddingCouple | null {
  return settings?.groom ?? null
}

export function getCoupleNames(settings: WeddingSettings | null): {
  bride: string
  groom: string
  brideFull: string
  groomFull: string
} {
  return {
    bride: settings?.bride?.short_name || 'Wanita',
    groom: settings?.groom?.short_name || 'Pria',
    brideFull: settings?.bride?.full_name || 'Mempelai Wanita',
    groomFull: settings?.groom?.full_name || 'Mempelai Pria',
  }
}

// =====================================================
// Event helpers
// =====================================================

export function getEvent(
  settings: WeddingSettings | null,
  type: WeddingEventType
): WeddingEvent | null {
  return settings?.events?.find((e) => e.event_type === type) ?? null
}

export function getAkad(settings: WeddingSettings | null): WeddingEvent | null {
  return getEvent(settings, 'akad')
}

export function getReception(settings: WeddingSettings | null): WeddingEvent | null {
  return getEvent(settings, 'reception')
}

export function getAllEvents(settings: WeddingSettings | null): WeddingEvent[] {
  return settings?.events ?? []
}

// =====================================================
// Gift account helpers
// =====================================================

export function getGiftAccount(
  settings: WeddingSettings | null,
  type: 'bank' | 'qris'
): WeddingGiftAccount | null {
  return settings?.gift_accounts?.find((a) => a.provider_type === type) ?? null
}

export function getBankAccount(settings: WeddingSettings | null): WeddingGiftAccount | null {
  return getGiftAccount(settings, 'bank')
}

export function getQrisAccount(settings: WeddingSettings | null): WeddingGiftAccount | null {
  return getGiftAccount(settings, 'qris')
}

export function getAllGiftAccounts(settings: WeddingSettings | null): WeddingGiftAccount[] {
  return settings?.gift_accounts ?? []
}

// =====================================================
// Social link helpers
// =====================================================

export function getSocialLink(
  settings: WeddingSettings | null,
  platform: string
): WeddingSocialLink | null {
  return settings?.social_links?.find((l) => l.platform === platform) ?? null
}

export function getInstagram(settings: WeddingSettings | null): WeddingSocialLink | null {
  return getSocialLink(settings, 'instagram')
}

export function getAllSocialLinks(settings: WeddingSettings | null): WeddingSocialLink[] {
  return settings?.social_links ?? []
}

// =====================================================
// Theme helpers
// =====================================================

export function getTheme(settings: WeddingSettings | null): WeddingTheme | null {
  return settings?.theme ?? null
}

export function getThemeColors(settings: WeddingSettings | null): {
  primary: string
  accent: string
  text: string
  background: string
} {
  return {
    primary: settings?.theme?.primary_color || '#B8935A',
    accent: settings?.theme?.accent_color || '#D4A574',
    text: settings?.theme?.text_color || '#3D342B',
    background: settings?.theme?.background_color || '#FBF8F3',
  }
}

export function getFontPreset(settings: WeddingSettings | null): string {
  return settings?.theme?.font_preset || 'classic-elegance'
}

export function getBackgroundStyle(settings: WeddingSettings | null): string {
  return settings?.theme?.background_style || 'botanical'
}

export function getHeroImage(settings: WeddingSettings | null): string | null {
  return settings?.theme?.hero_image_url ?? null
}

export function getCoverImage(settings: WeddingSettings | null): string | null {
  return settings?.theme?.cover_background_url ?? null
}

// =====================================================
// Media helpers
// =====================================================

export function getMedia(settings: WeddingSettings | null): WeddingMedia | null {
  return settings?.media ?? null
}

export function getMusicUrl(settings: WeddingSettings | null): string | null {
  return settings?.media?.music_url ?? null
}

export function getLiveStreamUrl(settings: WeddingSettings | null): string | null {
  return settings?.media?.live_stream_url ?? null
}

// =====================================================
// SEO helpers
// =====================================================

export function getSeo(settings: WeddingSettings | null): WeddingSeo | null {
  return settings?.seo ?? null
}

export function getMetaTitle(settings: WeddingSettings | null): string {
  const names = getCoupleNames(settings)
  return (
    settings?.seo?.meta_title ||
    `Undangan Pernikahan ${names.bride} & ${names.groom}`
  )
}

export function getMetaDescription(settings: WeddingSettings | null): string {
  const quote = settings?.wedding?.quote
  return (
    settings?.seo?.meta_description ||
    quote ||
    'Kami mengundang Anda untuk merayakan pernikahan kami.'
  )
}

export function getMetaImage(settings: WeddingSettings | null): string | null {
  return (
    settings?.seo?.meta_image_url ||
    settings?.theme?.hero_image_url ||
    settings?.theme?.cover_background_url ||
    null
  )
}

// =====================================================
// Feature helpers
// =====================================================

export function getFeatures(settings: WeddingSettings | null): {
  gallery: boolean
  documentary: boolean
  loveStory: boolean
  wishesWall: boolean
  music: boolean
} {
  return {
    gallery: settings?.features?.enable_gallery ?? true,
    documentary: settings?.features?.enable_documentary ?? true,
    loveStory: settings?.features?.enable_love_story ?? true,
    wishesWall: settings?.features?.enable_wishes_wall ?? true,
    music: settings?.features?.enable_music ?? false,
  }
}

export function isFeatureEnabled(
  settings: WeddingSettings | null,
  feature: WeddingFeatureFlag
): boolean {
  return settings?.features?.[feature] ?? false
}

// =====================================================
// Date & timezone helpers (FIXED - semua pakai optional chaining lengkap)
// =====================================================

export function getWeddingDate(settings: WeddingSettings | null): string | null {
  return settings?.wedding?.wedding_date ?? null
}

export function getTimezone(settings: WeddingSettings | null): string {
  return settings?.wedding?.timezone || 'Asia/Jakarta'
}

export function getHashtag(settings: WeddingSettings | null): string | null {
  return settings?.wedding?.hashtag ?? null
}

export function getDresscode(settings: WeddingSettings | null): string | null {
  return settings?.wedding?.dresscode ?? null
}

export function getQuote(settings: WeddingSettings | null): string | null {
  return settings?.wedding?.quote ?? null
}

export function getOpeningText(settings: WeddingSettings | null): string | null {
  return settings?.wedding?.opening_text ?? null
}

export function getClosingText(settings: WeddingSettings | null): string | null {
  return settings?.wedding?.closing_text ?? null
}