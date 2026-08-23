'use client'

import { motion } from 'framer-motion'
import type { WeddingSettings } from '@/types/database'
import { getThemeColors } from '@/lib/wedding-helpers'

interface LoadingSpinnerProps {
  text?: string
  /** Theme settings untuk warna adaptif (opsional) */
  settings?: WeddingSettings
  /** Ukuran spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Full screen mode (untuk loading page) */
  fullScreen?: boolean
}

// Default colors (fallback jika tidak ada settings)
const DEFAULT_PRIMARY = '#C9A96E'
const DEFAULT_TEXT = '#6B5B5B'

export function LoadingSpinner({
  text = 'Memuat...',
  settings,
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Extract colors: pakai settings jika ada, fallback ke default
  const colors = settings
    ? getThemeColors(settings)
    : {
        primary: DEFAULT_PRIMARY,
        accent: DEFAULT_PRIMARY,
        text: DEFAULT_TEXT,
        background: '#FBF8F3',
      }

  // Size mapping
  const sizeMap = {
    sm: { spinner: 'w-8 h-8', border: 'border-2', text: 'text-xs' },
    md: { spinner: 'w-12 h-12', border: 'border-4', text: 'text-sm' },
    lg: { spinner: 'w-16 h-16', border: 'border-4', text: 'text-base' },
  }

  const currentSize = sizeMap[size]

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Spinner dengan 3 layer animation */}
      <div className={`relative ${currentSize.spinner} mb-4`}>
        {/* Outer ring - subtle */}
        <div
          className={`absolute inset-0 rounded-full ${currentSize.border}`}
          style={{ borderColor: `${colors.primary}15` }}
        />

        {/* Middle ring - pulse */}
        <motion.div
          className={`absolute inset-0 rounded-full ${currentSize.border}`}
          style={{ borderColor: `${colors.primary}40` }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Inner ring - spinning (gradient effect) */}
        <div
          className={`absolute inset-0 rounded-full ${currentSize.border} animate-spin`}
          style={{
            borderColor: `${colors.primary}20`,
            borderTopColor: colors.primary,
            borderRightColor: colors.accent,
          }}
        />

        {/* Center dot - pulse */}
        <motion.div
          className="absolute inset-0 m-auto w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.primary }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Loading text */}
      <motion.p
        className={`font-elegant italic ${currentSize.text}`}
        style={{ color: colors.text, opacity: 0.7 }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.p>

      {/* Decorative dots */}
      <motion.div
        className="flex gap-1 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: colors.primary }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  )

  // Full screen mode
  if (fullScreen) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}