import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import { NotFoundContent } from '@/components/NotFoundContent'

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan | Wedding Invitation',
  description: 'Halaman yang Anda cari tidak ditemukan',
  robots: { index: false, follow: false },
}

// Default fallback colors jika theme tidak ada
const DEFAULT_THEME = {
  primary_color: '#C9A96E',
  accent_color: '#DCAE96',
  text_color: '#3D342B',
  background_color: '#FBF8F3',
}

async function getThemeColors() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('wedding_themes')
      .select('primary_color, accent_color, text_color, background_color')
      .maybeSingle()

    return data || DEFAULT_THEME
  } catch (err) {
    console.error('[not-found] Failed to fetch theme:', err)
    return DEFAULT_THEME
  }
}

export default async function NotFound() {
  const theme = await getThemeColors()

  return (
    <NotFoundContent
      primaryColor={theme.primary_color}
      accentColor={theme.accent_color}
      textColor={theme.text_color}
      backgroundColor={theme.background_color}
    />
  )
}