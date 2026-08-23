'use client'

import { motion, useInView } from 'framer-motion'
import { Guest, WeddingSettings } from '@/types/database'
import { MessageCircleHeart, Heart } from 'lucide-react'
import { useRef } from 'react'
import { getAdaptiveStyles, withAlpha, hexToRgba } from '@/lib/theme-utils'
import { getThemeColors } from '@/lib/wedding-helpers'
import {
  ThemeText,
  OrnamentDivider,
} from '@/components/ui/ThemeCard'

interface WishesWallProps {
  wishes: Guest[]
  settings: WeddingSettings
}

export function WishesWall({ wishes, settings }: WishesWallProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)

  const validWishes = wishes.filter((w) => w.wish && w.wish.trim().length > 0)
  if (validWishes.length === 0) return null

  const row1 = validWishes.slice(0, Math.ceil(validWishes.length / 2))
  const row2 = validWishes.slice(Math.ceil(validWishes.length / 2))

  // ✅ Adaptive card style untuk wish card
  const getCardStyle = (): React.CSSProperties => ({
    backgroundColor: styles.isDark
      ? hexToRgba(colors.text, 0.06)
      : '#FFFFFF',
    border: `1px solid ${withAlpha(colors.primary, styles.isDark ? 0.2 : 0.15)}`,
    boxShadow: styles.isDark
      ? '0 2px 8px rgba(0,0,0,0.3)'
      : `0 2px 8px ${withAlpha(colors.primary, 0.08)}`,
  })

  // ✅ Gradient untuk fade edges (pakai background color dari theme)
  const getFadeGradient = (direction: 'left' | 'right'): React.CSSProperties => ({
    background: `linear-gradient(to ${direction}, ${colors.background}, transparent)`,
  })

  const WishCard = ({ wish }: { wish: Guest }) => {
    const isHadir = wish.rsvp_status === 'hadir'
    const initial = wish.name.charAt(0).toUpperCase()

    return (
      <div
        className="flex-shrink-0 w-64 md:w-72 p-5 rounded-2xl mr-4"
        style={getCardStyle()}
      >
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar dengan gradient theme */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              boxShadow: `0 2px 6px ${withAlpha(colors.primary, 0.3)}`,
            }}
          >
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className="font-elegant font-semibold text-sm truncate"
              style={{ color: styles.text.primary }}
            >
              {wish.name}
            </h4>

            {/* Status Badge */}
            {wish.rsvp_status && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium mt-0.5"
                style={{
                  backgroundColor: isHadir
                    ? withAlpha(colors.primary, styles.isDark ? 0.2 : 0.12)
                    : withAlpha('#EF4444', styles.isDark ? 0.2 : 0.12),
                  color: isHadir
                    ? colors.primary
                    : styles.isDark
                    ? '#FCA5A5'
                    : '#DC2626',
                }}
              >
                {isHadir ? (
                  <>
                    <Heart size={8} fill="currentColor" /> Hadir
                  </>
                ) : (
                  'Tidak Hadir'
                )}
              </span>
            )}
          </div>
        </div>

        {/* Wish Text */}
        <p
          className="font-elegant text-sm italic leading-relaxed line-clamp-3"
          style={{ color: styles.text.secondary }}
        >
          &ldquo;{wish.wish}&rdquo;
        </p>
      </div>
    )
  }

  return (
    <section
      ref={ref}
      id="wishes"
      className="py-20 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div className="px-5 max-w-2xl mx-auto mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <ThemeText
            settings={settings}
            level="secondary"
            className="text-[10px] uppercase tracking-[0.4em] mb-3 font-medium"
            style={{ color: colors.primary }}
          >
            Love Notes
          </ThemeText>

          <ThemeText
            settings={settings}
            as="h2"
            className="font-display text-3xl md:text-4xl mb-4"
          >
            Ucapan & Doa
          </ThemeText>

          <OrnamentDivider settings={settings} />

          <ThemeText
            settings={settings}
            level="muted"
            className="mt-4 text-sm"
          >
            {validWishes.length} ucapan penuh cinta dari para tamu
          </ThemeText>
        </motion.div>
      </div>

      {/* Marquee Row 1 */}
      <div className="relative mb-4">
        {/* Fade Edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={getFadeGradient('right')}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={getFadeGradient('left')}
        />

        {/* Scrolling Cards */}
        <div className="flex marquee-scroll">
          {[...row1, ...row1].map((wish, index) => (
            <WishCard key={`row1-${wish.id}-${index}`} wish={wish} />
          ))}
        </div>
      </div>

      {/* Marquee Row 2 (reverse direction) */}
      {row2.length > 0 && (
        <div className="relative">
          {/* Fade Edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={getFadeGradient('right')}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={getFadeGradient('left')}
          />

          {/* Scrolling Cards (reverse) */}
          <div className="flex marquee-scroll-reverse">
            {[...row2, ...row2].map((wish, index) => (
              <WishCard key={`row2-${wish.id}-${index}`} wish={wish} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}