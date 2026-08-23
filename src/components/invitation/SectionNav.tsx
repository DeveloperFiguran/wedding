'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Heart, Calendar, Images, Gift, MessageCircleHeart,
} from 'lucide-react'
import { getAdaptiveStyles, withAlpha, hexToRgba } from '@/lib/theme-utils'
import { getThemeColors } from '@/lib/wedding-helpers'
import type { WeddingSettings } from '@/types/database'

interface SectionNavProps {
  settings: WeddingSettings
  enableGallery: boolean
  isMusicActive?: boolean
  scrollThreshold?: number
}

export function SectionNav({
  settings,
  enableGallery,
  isMusicActive = false,
  scrollThreshold = 300,
}: SectionNavProps) {
  const [activeSection, setActiveSection] = useState('home')
  const [isVisible, setIsVisible] = useState(false)

  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)

  const sections = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'couple', label: 'Couple', icon: Heart },
    { id: 'events', label: 'Acara', icon: Calendar },
    ...(enableGallery ? [{ id: 'gallery', label: 'Gallery', icon: Images }] : []),
    { id: 'gift', label: 'Hadiah', icon: Gift },
    { id: 'rsvp', label: 'RSVP', icon: MessageCircleHeart },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      // Nav muncul setelah scroll melewati threshold
      setIsVisible(scrollY > scrollThreshold)

      // Active section detection
      const scrollPos = scrollY + window.innerHeight / 3
      sections.forEach((section) => {
        const el = document.getElementById(section.id)
        if (el) {
          const { offsetTop, offsetHeight } = el
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section.id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableGallery, scrollThreshold])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      // Offset untuk menghindari bagian atas tertutup (header/top)
      const offset = 20
      const elementPosition = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      })
    }
  }

  // ✅ Adaptive container style untuk bottom bar
  const getContainerStyle = (): React.CSSProperties => ({
    backgroundColor: styles.isDark
      ? hexToRgba(colors.text, 0.08)
      : 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderTop: `1px solid ${withAlpha(colors.primary, styles.isDark ? 0.2 : 0.15)}`,
    boxShadow: styles.isDark
      ? '0 -4px 20px rgba(0,0,0,0.3)'
      : '0 -4px 20px rgba(0,0,0,0.06)',
  })

  // ✅ Top accent line (gradient dari theme)
  const getTopAccentStyle = (): React.CSSProperties => ({
    background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.accent}, ${colors.primary}, transparent)`,
  })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className="fixed left-0 right-0 bottom-0 z-50 md:hidden"
          style={{
            // ✅ Safe area untuk notch/home indicator
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Top Accent Line */}
          <div className="h-[2px] w-full" style={getTopAccentStyle()} />

          {/* Bottom Bar Container */}
          <div className="px-1 py-2" style={getContainerStyle()}>
            <div className="flex items-center justify-around">
              {sections.map((section) => {
                const isActive = activeSection === section.id
                const Icon = section.icon

                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-2 flex-1 min-w-0 transition-all duration-200"
                    aria-label={section.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Active Indicator - Dot atas */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute -top-0.5 left-1/2 -translate-x-1/2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', damping: 20 }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                              boxShadow: `0 0 8px ${withAlpha(colors.primary, 0.6)}`,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Icon dengan subtle background saat aktif */}
                    <div className="relative">
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 -m-1.5 rounded-xl"
                          style={{
                            backgroundColor: withAlpha(
                              colors.primary,
                              styles.isDark ? 0.2 : 0.12
                            ),
                          }}
                          layoutId="navIconBg"
                          transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                          }}
                        />
                      )}
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className="relative z-10 transition-all duration-200"
                        style={{
                          color: isActive ? colors.primary : colors.text,
                          opacity: isActive ? 1 : styles.isDark ? 0.6 : 0.55,
                        }}
                        fill={isActive ? withAlpha(colors.primary, 0.15) : 'none'}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider transition-all duration-200 truncate max-w-full"
                      style={{
                        color: isActive ? colors.primary : colors.text,
                        opacity: isActive ? 1 : styles.isDark ? 0.6 : 0.55,
                      }}
                    >
                      {section.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}