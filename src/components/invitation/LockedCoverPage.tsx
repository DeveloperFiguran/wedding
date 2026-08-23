'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { WeddingSettings, WeddingCouple } from '@/types/database'
import { Lock, Sparkles, Music } from 'lucide-react'
import { ElegantBackground } from './ElegantBackground'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SafeImage } from '@/components/ui/SafeImage'
import { isValidImageUrl } from '@/lib/validation'
import { getFontVariables } from '@/lib/fonts'
import { MusicPlayer } from './MusicPlayer'
import { FontLoader } from '@/components/FontLoader'
import { formatDateShort } from '@/lib/utils'
import { useHydrated } from '@/hooks/useHydrated'
import {
  getAdaptiveStyles,
  withAlpha,
  hexToRgba,
} from '@/lib/theme-utils'
import {
  ThemeCard,
  AccentIconBox,
  CornerAccents,
} from '@/components/ui/ThemeCard'
import {
  getThemeColors,
  getCoverImage,
  getBackgroundStyle,
  getCoupleNames,
  getWeddingDate,
  getHashtag,
  getFontPreset,
  getMusicUrl,
  isFeatureEnabled,
  getTimezone,
} from '@/lib/wedding-helpers'

function createDefaultSettings(): WeddingSettings {
  const now = new Date().toISOString()
  return {
    wedding: {
      id: 'default',
      wedding_date: new Date(
        Date.now() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'Asia/Jakarta',
      dresscode: null,
      quote: null,
      opening_text: null,
      closing_text: null,
      hashtag: null,
      created_at: now,
      updated_at: now,
    },
    bride: null,
    groom: null,
    events: [],
    gift_accounts: [],
    social_links: [],
    theme: null,
    media: null,
    seo: null,
    features: null,
  }
}

export function LockedCoverPage() {
  const hydrated = useHydrated()
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isUsingDefault, setIsUsingDefault] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const [
        weddingRes,
        couplesRes,
        eventsRes,
        giftAccountsRes,
        socialLinksRes,
        themeRes,
        mediaRes,
        seoRes,
        featuresRes,
      ] = await Promise.all([
        supabase.from('weddings').select('*').maybeSingle(),
        supabase.from('wedding_couples').select('*'),
        supabase.from('wedding_events').select('*'),
        supabase
          .from('wedding_gift_accounts')
          .select('*')
          .order('sort_order'),
        supabase
          .from('wedding_social_links')
          .select('*')
          .order('sort_order'),
        supabase.from('wedding_themes').select('*').maybeSingle(),
        supabase.from('wedding_media').select('*').maybeSingle(),
        supabase.from('wedding_seos').select('*').maybeSingle(),
        supabase.from('wedding_features').select('*').maybeSingle(),
      ])

      if (!weddingRes.data) {
        console.warn('[LockedCover] Settings tidak ditemukan, pakai default')
        setSettings(createDefaultSettings())
        setIsUsingDefault(true)
        return
      }

      const bride =
        couplesRes.data?.find((c: WeddingCouple) => c.role === 'bride') || null
      const groom =
        couplesRes.data?.find((c: WeddingCouple) => c.role === 'groom') || null
      const theme = themeRes.data

      const isEmptyData = !bride && !groom && !theme

      setSettings({
        wedding: weddingRes.data,
        bride,
        groom,
        events: eventsRes.data || [],
        gift_accounts: giftAccountsRes.data || [],
        social_links: socialLinksRes.data || [],
        theme,
        media: mediaRes.data,
        seo: seoRes.data,
        features: featuresRes.data,
      })
      setIsUsingDefault(isEmptyData)
    } catch (err) {
      console.error('[LockedCover] Error:', err)
      setSettings(createDefaultSettings())
      setIsUsingDefault(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen mobile-full flex items-center justify-center bg-[#FBF8F3]">
        <LoadingSpinner text="Memuat..." />
      </div>
    )
  }

  if (!settings) return null

  // ✅ Extract semua data dari helpers
  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)
  const coverImage = getCoverImage(settings)
  const backgroundStyle = getBackgroundStyle(settings)
  const names = getCoupleNames(settings)
  const weddingDate = getWeddingDate(settings)
  const hashtag = getHashtag(settings)
  const fontPreset = getFontPreset(settings)
  const musicUrl = getMusicUrl(settings)
  const timezone = getTimezone(settings)
  const isMusicEnabled = isFeatureEnabled(settings, 'enable_music')

  const hasCoverImage = isValidImageUrl(coverImage)

  // ✅ FIX: Dark jika ada cover image ATAU theme background dark
  const isDark = hasCoverImage || styles.isDark

  // Text colors yang lebih jelas
  const textColor = isDark ? '#FFFFFF' : colors.text
  const subtextColor = isDark
    ? 'rgba(255,255,255,0.9)'
    : withAlpha(colors.text, 0.75)
  const faintColor = isDark
    ? 'rgba(255,255,255,0.65)'
    : withAlpha(colors.text, 0.55)

  // ✅ Card style yang sesuai dengan 3 kondisi
  const getNoticeCardStyle = (): React.CSSProperties => {
    if (hasCoverImage) {
      // Ada cover image: glass sangat translucent
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${withAlpha(colors.accent, 0.2)} inset`,
      }
    } else if (styles.isDark) {
      // Theme dark (navy/black): pakai tint dari TEXT COLOR
      return {
        backgroundColor: hexToRgba(colors.text, 0.08),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${withAlpha(colors.primary, 0.25)}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${withAlpha(colors.primary, 0.15)} inset`,
      }
    } else {
      // Theme light: solid white dengan shadow soft
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${withAlpha(colors.primary, 0.2)}`,
        boxShadow: `0 8px 32px ${withAlpha(colors.primary, 0.15)}, 0 0 0 1px ${withAlpha(colors.primary, 0.08)} inset`,
      }
    }
  }

  if (!hydrated) {
    return (
      <div
        className="min-h-screen mobile-full flex items-center justify-center"
        style={{
          backgroundColor: colors.background,
          ...getFontVariables(fontPreset),
        }}
      >
        <LoadingSpinner text="Memuat..." />
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen mobile-full overflow-hidden"
      style={{
        ...getFontVariables(fontPreset),
        backgroundColor: colors.background,
      }}
    >
      <FontLoader presetId={fontPreset} />

      {isMusicEnabled && musicUrl && (
        <MusicPlayer
          musicUrl={musicUrl}
          settings={settings}
        />
      )}

      {/* ============ BACKGROUND ============ */}
      <div className="absolute inset-0">
        {hasCoverImage ? (
          <>
            <div className="absolute inset-0">
              <SafeImage
                src={coverImage!}
                alt="Wedding Cover"
                fill
                priority
                className={`object-cover transition-opacity duration-1000 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
          </>
        ) : (
          <ElegantBackground
            primaryColor={colors.primary}
            accentColor={colors.accent}
            backgroundColor={colors.background}
            variant="cover"
            style={backgroundStyle}
          />
        )}
      </div>

      {/* Grain overlay untuk dark theme */}
      {isDark && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="lockedNoise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#lockedNoise)" />
          </svg>
        </div>
      )}

      {/* ============ TOP ORNAMENT ============ */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <svg
          width="160"
          height="40"
          viewBox="0 0 160 40"
          style={{
            color: isDark ? 'rgba(255,255,255,0.7)' : colors.primary,
          }}
        >
          <path
            d="M10 20 Q80 -5 150 20"
            stroke="currentColor"
            fill="none"
            strokeWidth="0.8"
          />
          <circle cx="80" cy="10" r="2.5" fill="currentColor" />
          <path
            d="M65 15 Q80 5 95 15"
            stroke="currentColor"
            fill="none"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 min-h-screen mobile-full flex flex-col items-center justify-between px-6 py-14 text-center">
        {/* Top Label */}
        <div className="pt-6">
          <motion.p
            className="text-label-md uppercase font-medium"
            style={{ color: subtextColor }}
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ delay: 0.8, duration: 1.2 }}
          >
            The Wedding of
          </motion.p>
        </div>

        {/* Center - Names */}
        <div className="flex-1 flex flex-col items-center justify-center w-full py-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <h1
              className="font-script text-name-xl mb-2"
              style={{
                color: textColor,
                textShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {names.bride}
            </h1>

            {/* Ornament Divider */}
            <motion.div
              className="flex items-center justify-center my-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <div
                className="w-14 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${
                    isDark ? 'rgba(255,255,255,0.6)' : colors.primary
                  })`,
                }}
              />
              <Sparkles
                className="mx-3 animate-pulse-soft"
                size={18}
                style={{ color: colors.accent }}
              />
              <div
                className="w-14 h-px"
                style={{
                  background: `linear-gradient(270deg, transparent, ${
                    isDark ? 'rgba(255,255,255,0.6)' : colors.primary
                  })`,
                }}
              />
            </motion.div>

            <h1
              className="font-script text-name-xl"
              style={{
                color: textColor,
                textShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {names.groom}
            </h1>
          </motion.div>

          {/* Date & Hashtag */}
          <motion.div
            className="mt-8 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            {weddingDate && (
              <p
                className="text-body-md font-light tracking-[0.2em] uppercase"
                style={{ color: subtextColor }}
              >
                {formatDateShort(weddingDate, timezone)}
              </p>
            )}
            {hashtag && (
              <p
                className="text-body-sm font-elegant italic"
                style={{ color: faintColor }}
              >
                {hashtag}
              </p>
            )}
          </motion.div>
        </div>

        {/* ============ NOTICE CARD ============ */}
        <div className="w-full max-w-sm pb-2">
          <ThemeCard
            settings={settings}
            variant="glass"
            animated
            delay={2.1}
            className="relative overflow-hidden !shadow-2xl"
            style={getNoticeCardStyle()}
          >
            {/* Corner Accents */}
            <CornerAccents settings={settings} />

            {/* Top Gradient Line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
              }}
            />

            {/* Icon dengan AccentIconBox (match dengan button) */}
            <div className="flex justify-center mb-4 relative z-10">
              <AccentIconBox settings={settings} size="lg" shape="circle">
                {isUsingDefault ? (
                  <Music size={24} />
                ) : (
                  <Lock size={24} />
                )}
              </AccentIconBox>
            </div>

            {/* Title */}
            <motion.h3
              className="font-elegant text-xl md:text-2xl font-semibold leading-tight mb-2 text-center relative z-10"
              style={{
                color: isDark ? '#FFFFFF' : colors.text,
                textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4 }}
            >
              {isUsingDefault ? 'Selamat Datang' : 'Undangan Digital'}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-body-sm leading-relaxed text-center relative z-10"
              style={{ color: faintColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              Undangan ini bersifat privat. Silakan buka melalui link resmi yang
              telah dikirimkan kepada Anda.
            </motion.p>

            {/* Ornament divider */}
            <div className="flex items-center justify-center gap-2 mt-4 mb-1 relative z-10">
              <div
                className="w-12 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${withAlpha(colors.accent, 0.4)})`,
                }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.accent }}
              />
              <div
                className="w-12 h-px"
                style={{
                  background: `linear-gradient(270deg, transparent, ${withAlpha(colors.accent, 0.4)})`,
                }}
              />
            </div>
          </ThemeCard>
        </div>
      </div>
    </div>
  )
}