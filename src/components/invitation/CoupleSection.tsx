'use client'

import { motion, useInView } from 'framer-motion'
import { WeddingSettings } from '@/types/database'
import { Heart, Instagram } from 'lucide-react'
import { useRef } from 'react'
import { SafeImage } from '@/components/ui/SafeImage'
import { SafeLink } from '@/components/ui/SafeLink'
import { ElegantBackground } from './ElegantBackground'
import { isValidImageUrl, sanitizeInstagramUsername } from '@/lib/validation'
import {
  getBride,
  getGroom,
  getInstagram,
  getThemeColors,
  getBackgroundStyle,
  getOpeningText,
} from '@/lib/wedding-helpers'

interface CoupleSectionProps {
  settings: WeddingSettings
}

export function CoupleSection({ settings }: CoupleSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const bride = getBride(settings)
  const groom = getGroom(settings)
  const instagram = getInstagram(settings)
  const colors = getThemeColors(settings)
  const backgroundStyle = getBackgroundStyle(settings)
  const openingText = getOpeningText(settings)

  const hasBridePhoto = isValidImageUrl(bride?.photo_url || '')
  const hasGroomPhoto = isValidImageUrl(groom?.photo_url || '')
  const safeInstagram = sanitizeInstagramUsername(instagram?.username || '')

  return (
    <section
      id="couple"
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Background decoration */}
      <ElegantBackground
        primaryColor={colors.primary}
        accentColor={colors.accent}
        backgroundColor={colors.background}
        variant="section"
        style={backgroundStyle}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p
            className="text-label-md uppercase mb-4 font-medium"
            style={{ color: colors.primary }}
          >
            Bismillahirrahmanirrahim
          </p>

        {/* Opening text */}
        {openingText && (
          <motion.p
            className="text-center font-elegant text-body-lg italic mb-16 leading-relaxed font-medium"
            style={{ color: colors.text, opacity: 0.9 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 1 }}
          >
            {openingText}
          </motion.p>
        )}
          
          {/* <h2 className="font-display text-heading-xl mb-5" style={{ color: colors.text }}>
            Mempelai
          </h2> */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-px" style={{ backgroundColor: colors.primary }} />
            <Heart size={18} fill={colors.accent} style={{ color: colors.accent }} />
            <div className="w-12 h-px" style={{ backgroundColor: colors.primary }} />
          </div>
        </motion.div>

        <div className="space-y-16">
          {/* ====== BRIDE ====== */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative mx-auto mb-8 w-56 h-72 md:w-64 md:h-80">
              {/* Arch border luar */}
              <div
                className="absolute -inset-3 rounded-t-full border-2 opacity-50"
                style={{ borderColor: colors.primary }}
              />
              {/* Arch border dalam */}
              <div
                className="absolute -inset-1.5 rounded-t-full border opacity-30"
                style={{ borderColor: colors.accent }}
              />

              {hasBridePhoto ? (
                <div className="relative w-full h-full rounded-t-full overflow-hidden shadow-xl">
                  <SafeImage
                    src={bride?.photo_url || ''}
                    alt={bride?.full_name || 'Mempelai Wanita'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full rounded-t-full flex items-center justify-center font-script text-8xl shadow-xl"
                  style={{
                    background: `linear-gradient(160deg, ${colors.primary}20, ${colors.accent}30)`,
                    color: colors.primary,
                  }}
                >
                  {(bride?.short_name || 'W').charAt(0)}
                </div>
              )}
            </div>

            <h3 className="font-script text-name-lg mb-4" style={{ color: colors.text }}>
              {bride?.full_name || 'Mempelai Wanita'}
            </h3>
            <p className="text-body-md font-elegant italic mb-1" style={{ color: colors.text, opacity: 0.7 }}>
              Putri dari
            </p>
            {bride?.parents && (
              <p className="text-body-md font-elegant font-semibold" style={{ color: colors.text }}>
                {bride.parents}
              </p>
            )}
            {safeInstagram && (
              <SafeLink
                href={`https://instagram.com/${safeInstagram}`}
                className="mt-4 text-body-sm font-medium hover:opacity-70 transition-opacity inline-flex items-center gap-2"
                style={{ color: colors.primary }}
              >
                <Instagram size={16} />
                @{safeInstagram}
              </SafeLink>
            )}
          </motion.div>

          {/* ====== DIVIDER ====== */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="w-20 h-px" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
            <Heart
              size={30}
              fill={colors.accent}
              style={{ color: colors.accent }}
              className="mx-4 animate-pulse-soft"
            />
            <div className="w-20 h-px" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
          </motion.div>

          {/* ====== GROOM ====== */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="relative mx-auto mb-8 w-56 h-72 md:w-64 md:h-80">
              <div
                className="absolute -inset-3 rounded-t-full border-2 opacity-50"
                style={{ borderColor: colors.primary }}
              />
              <div
                className="absolute -inset-1.5 rounded-t-full border opacity-30"
                style={{ borderColor: colors.accent }}
              />

              {hasGroomPhoto ? (
                <div className="relative w-full h-full rounded-t-full overflow-hidden shadow-xl">
                  <SafeImage
                    src={groom?.photo_url || ''}
                    alt={groom?.full_name || 'Mempelai Pria'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full rounded-t-full flex items-center justify-center font-script text-8xl shadow-xl"
                  style={{
                    background: `linear-gradient(160deg, ${colors.accent}25, ${colors.primary}30)`,
                    color: colors.primary,
                  }}
                >
                  {(groom?.short_name || 'P').charAt(0)}
                </div>
              )}
            </div>

            <h3 className="font-script text-name-lg mb-4" style={{ color: colors.text }}>
              {groom?.full_name || 'Mempelai Pria'}
            </h3>
            <p className="text-body-md font-elegant italic mb-1" style={{ color: colors.text, opacity: 0.7 }}>
              Putra dari
            </p>
            {groom?.parents && (
              <p className="text-body-md font-elegant font-semibold" style={{ color: colors.text }}>
                {groom.parents}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}