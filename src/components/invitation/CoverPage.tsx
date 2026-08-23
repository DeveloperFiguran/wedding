'use client'

import { motion } from 'framer-motion'
import { WeddingSettings, Guest } from '@/types/database'
import { MailOpen, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { ElegantBackground } from './ElegantBackground'
import { hasValue, formatDateShort } from '@/lib/utils'
import { SafeImage } from '@/components/ui/SafeImage'
import { isValidImageUrl } from '@/lib/validation'
import { getAdaptiveStyles, withAlpha, hexToRgba } from '@/lib/theme-utils'
import {
  getThemeColors,
  getCoverImage,
  getBackgroundStyle,
  getCoupleNames,
  getWeddingDate,
  getHashtag,
  getTimezone,
} from '@/lib/wedding-helpers'
import {
  ThemeCard,
  ThemeText,
  ThemeButton,
  CornerAccents,
} from '@/components/ui/ThemeCard'

interface CoverPageProps {
  settings: WeddingSettings
  guest: Guest
  onOpen: () => void
}

export function CoverPage({ settings, guest, onOpen }: CoverPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)
  const coverImage = getCoverImage(settings)
  const backgroundStyle = getBackgroundStyle(settings)
  const names = getCoupleNames(settings)
  const weddingDate = getWeddingDate(settings)
  const hashtag = getHashtag(settings)
  const timezone = getTimezone(settings)

  const handleOpen = () => {
    setIsOpening(true)
    setTimeout(() => onOpen(), 100)
  }

  const hasCoverImage = isValidImageUrl(coverImage)

  // ✅ FIX: Dark jika ada cover image ATAU theme background dark
  const isDark = hasCoverImage || styles.isDark

  // Text colors yang lebih jelas untuk kedua kondisi
  const textColor = isDark ? '#FFFFFF' : colors.text
  const subtextColor = isDark ? 'rgba(255,255,255,0.9)' : withAlpha(colors.text, 0.75)
  const faintColor = isDark ? 'rgba(255,255,255,0.65)' : withAlpha(colors.text, 0.55)

  // ✅ Card style yang lebih jelas untuk kedua kondisi
  const getCardStyle = (): React.CSSProperties => {
    if (hasCoverImage) {
      // Ada cover image: pakai glass sangat translucent dengan border tipis
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid rgba(255, 255, 255, 0.15)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${withAlpha(colors.accent, 0.2)} inset`,
      }
    } else if (styles.isDark) {
      // Theme dark (navy/black): pakai tint dari text color, bukan putih
      return {
        backgroundColor: hexToRgba(colors.text, 0.08),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${withAlpha(colors.primary, 0.25)}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${withAlpha(colors.primary, 0.15)} inset`,
      }
    } else {
      // Theme light: pakai solid white dengan shadow soft
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${withAlpha(colors.primary, 0.2)}`,
        boxShadow: `0 8px 32px ${withAlpha(colors.primary, 0.15)}, 0 0 0 1px ${withAlpha(colors.primary, 0.08)} inset`,
      }
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden mobile-full"
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* ============ BACKGROUND ============ */}
      <div className="absolute inset-0">
        {hasCoverImage ? (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.2 }}
              animate={{ scale: isOpening ? 1.3 : 1.1 }}
              transition={{ duration: 8, ease: 'linear' }}
            >
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
            </motion.div>
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
            <filter id="coverNoise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#coverNoise)" />
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
      <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 py-14 text-center">
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
                style={{
                  color: isDark ? colors.accent : colors.accent,
                }}
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
            {hasValue(hashtag) && (
              <p
                className="text-body-sm font-elegant italic"
                style={{ color: faintColor }}
              >
                {hashtag}
              </p>
            )}
          </motion.div>
        </div>

        {/* ============ BOTTOM - GUEST CARD & BUTTON ============ */}
        <div className="w-full max-w-sm space-y-5 pb-2">
          {/* GUEST CARD */}
          <ThemeCard
            settings={settings}
            variant="glass"
            animated
            delay={2.1}
            className="relative overflow-hidden !shadow-2xl"
            style={getCardStyle()}
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

            {/* Guest Info */}
            <div className="relative z-10">
              <p
                className="text-label-sm uppercase mb-3 tracking-[0.25em]"
                style={{ color: faintColor }}
              >
                Kepada Yth. Bapak/Ibu/Saudara/i
              </p>
              <h3
                className="font-elegant text-2xl md:text-3xl font-semibold leading-tight"
                style={{ 
                  color: isDark ? '#FFFFFF' : colors.text,
                  textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {guest.name}
              </h3>
              <p
                className="text-caption mt-3 italic"
                style={{ color: faintColor }}
              >
                Mohon maaf apabila ada kesalahan penulisan nama & gelar
              </p>
            </div>
          </ThemeCard>

          {/* OPEN BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.8 }}
          >
            <ThemeButton
              settings={settings}
              variant="primary"
              onClick={handleOpen}
              className="w-full !py-4 !rounded-full text-body-md tracking-wide relative overflow-hidden group"
              style={{
                boxShadow: `0 8px 24px ${withAlpha(colors.primary, 0.4)}`,
              }}
            >
              <motion.span
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <MailOpen
                size={20}
                className="relative z-10 group-hover:rotate-12 transition-transform"
              />
              <span className="relative z-10">Buka Undangan</span>
            </ThemeButton>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}