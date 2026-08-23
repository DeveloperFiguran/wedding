import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import { sanitizeText, sanitizeUrl } from '@/lib/validation'
import type {
  Wedding,
  WeddingCouple,
  WeddingTheme,
  WeddingSeo,
} from '@/types/database'

// =====================================================
// Default fallback values (tidak pakai DEFAULT_SETTINGS)
// =====================================================
const DEFAULT_COLORS = {
  primary_color: '#B8935A',
  accent_color: '#D4A574',
  text_color: '#3D342B',
  background_color: '#FBF8F3',
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

// =====================================================
// Fetch settings dari tabel normalized (4 tabel saja)
// =====================================================
interface FetchedSettings {
  wedding: Wedding | null
  bride: WeddingCouple | null
  groom: WeddingCouple | null
  theme: WeddingTheme | null
  seo: WeddingSeo | null
}

async function fetchSettings(): Promise<FetchedSettings> {
  try {
    const [weddingRes, couplesRes, themeRes, seoRes] = await Promise.all([
      supabase.from('weddings').select('*').maybeSingle(),
      supabase.from('wedding_couples').select('*'),
      supabase.from('wedding_themes').select('*').maybeSingle(),
      supabase.from('wedding_seos').select('*').maybeSingle(),
    ])

    if (weddingRes.error) {
      console.warn('[metadata] Wedding fetch error:', weddingRes.error.message)
    }
    if (couplesRes.error) {
      console.warn('[metadata] Couples fetch error:', couplesRes.error.message)
    }

    const bride =
      couplesRes.data?.find((c: WeddingCouple) => c.role === 'bride') || null
    const groom =
      couplesRes.data?.find((c: WeddingCouple) => c.role === 'groom') || null

    return {
      wedding: weddingRes.data || null,
      bride,
      groom,
      theme: themeRes.data || null,
      seo: seoRes.data || null,
    }
  } catch (err: any) {
    console.error('[metadata] Exception:', err.message)
    return {
      wedding: null,
      bride: null,
      groom: null,
      theme: null,
      seo: null,
    }
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return ''
  }
}

export async function buildInvitationMetadata(
  code?: string
): Promise<Metadata> {
  const { wedding, bride, groom, theme, seo } = await fetchSettings()
  const baseUrl = getBaseUrl()

  // Extract values dengan fallback
  const brideName = bride?.short_name || 'Wanita'
  const groomName = groom?.short_name || 'Pria'
  const brideFullname = bride?.full_name || 'Mempelai Wanita'
  const groomFullname = groom?.full_name || 'Mempelai Pria'
  const weddingDate = wedding?.wedding_date || null
  const heroImageUrl = theme?.hero_image_url || null
  const coverBackgroundUrl = theme?.cover_background_url || null
  const weddingHashtag = wedding?.hashtag || null
  const primaryColor = theme?.primary_color || DEFAULT_COLORS.primary_color

  // Meta fields
  const metaTitle = seo?.meta_title?.trim() || null
  const metaDescription = seo?.meta_description?.trim() || null
  const metaImageUrl = seo?.meta_image_url || null

  // Title dengan default fallback
  const autoTitle = `Undangan Pernikahan ${brideName} & ${groomName}`
  const rawTitle = metaTitle || autoTitle
  const title = rawTitle.slice(0, 60)

  // Description dengan default fallback
  const dateStr = formatDate(weddingDate)
  const autoDescription = `Kami mengundang Anda untuk merayakan pernikahan ${brideFullname} & ${groomFullname}${dateStr ? ` pada ${dateStr}` : ''
    }. Kehadiran Anda adalah kehormatan bagi kami.`
  const rawDescription = metaDescription || autoDescription
  const description = rawDescription.slice(0, 160)

  // Image dengan fallback (sanitize untuk prevent XSS)
  const ogImage =
    sanitizeUrl(metaImageUrl) ||
    sanitizeUrl(heroImageUrl) ||
    sanitizeUrl(coverBackgroundUrl) ||
    undefined

  const url = code ? `${baseUrl}/u/${code}` : baseUrl

  // Keywords
  const keywords = [
    'undangan pernikahan',
    'wedding invitation',
    sanitizeText(brideName),
    sanitizeText(groomName),
    weddingHashtag ? weddingHashtag.replace('#', '') : 'wedding',
  ].filter(Boolean)

  return {
    title,
    description,
    keywords,
    authors: [{ name: `${brideName} & ${groomName}` }],
    creator: `${brideName} & ${groomName}`,
    alternates: { canonical: url },
    icons: ogImage
      ? {
        icon: [{ url: ogImage, type: 'image/jpeg' }],
        apple: [{ url: ogImage, type: 'image/jpeg' }],
      }
      : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: `The Wedding of ${brideName} & ${groomName}`,
      images: ogImage
        ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
          },
        ]
        : undefined,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    themeColor: primaryColor,
    robots: { index: true, follow: true },
  }
}

export function buildAdminMetadata(pageTitle?: string): Metadata {
  const title = pageTitle
    ? `${pageTitle} | Admin Panel`
    : 'Admin Panel | Wedding Invitation'

  return {
    title,
    description: 'Panel administrasi undangan pernikahan digital',
    robots: { index: false, follow: false },
    themeColor: '#FBF8F3',
  }
}
