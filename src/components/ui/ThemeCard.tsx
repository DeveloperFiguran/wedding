// src/components/ui/ThemeCard.tsx

import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
// ✅ Import semua dari theme-utils (termasuk getThemeColors yang sudah di-re-export)
import {
  getAdaptiveStyles,
  getThemeColors,
  withAlpha,
  hexToRgba,
} from '@/lib/theme-utils'
import type { WeddingSettings } from '@/types/database'

// =====================================================
// TYPES
// =====================================================

export type CardVariant = 'solid' | 'glass' | 'elevated' | 'outline'
export type BadgeVariant = 'solid' | 'soft' | 'outline'
export type Size = 'sm' | 'md' | 'lg'
export type Shape = 'rounded' | 'circle' | 'square'

// =====================================================
// THEME CARD
// =====================================================

interface ThemeCardProps {
  settings: WeddingSettings
  variant?: CardVariant
  children: ReactNode
  className?: string
  style?: CSSProperties
  animated?: boolean
  delay?: number
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'xl' | '2xl' | '3xl'
}

export function ThemeCard({
  settings,
  variant = 'solid',
  children,
  className = '',
  style,
  animated = true,
  delay = 0,
  onClick,
  hover = false,
  padding = 'md',
  rounded = '3xl',
}: ThemeCardProps) {
  const styles = getAdaptiveStyles(settings)
  const variantStyle = styles.card[variant]

  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const roundedMap = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }

  const baseClasses = `
    ${roundedMap[rounded]}
    ${paddingMap[padding]}
    ${onClick ? 'cursor-pointer' : ''}
    ${hover ? 'transition-all duration-300' : ''}
    ${className}
  `.trim()

  const combinedStyle: CSSProperties = {
    ...variantStyle,
    ...style,
  }

  if (animated) {
    return (
      <motion.div
        className={baseClasses}
        style={combinedStyle}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={hover ? { y: -2 } : undefined}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} style={combinedStyle} onClick={onClick}>
      {children}
    </div>
  )
}

// =====================================================
// ACCENT ICON BOX (dengan shadow yang match button)
// =====================================================

interface AccentIconBoxProps {
  settings: WeddingSettings
  children: ReactNode
  size?: Size
  shape?: Shape
  className?: string
}

export function AccentIconBox({
  settings,
  children,
  size = 'md',
  shape = 'rounded',
  className = '',
}: AccentIconBoxProps) {
  const colors = getThemeColors(settings)

  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }

  const shapeMap = {
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
    square: 'rounded-lg',
  }

  return (
    <div
      className={`${sizeMap[size]} ${shapeMap[shape]} flex items-center justify-center text-white flex-shrink-0 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        boxShadow: `0 4px 14px ${withAlpha(colors.primary, 0.4)}`,
      }}
    >
      {children}
    </div>
  )
}

// =====================================================
// ICON BADGE (3 variants: soft, solid, outline)
// =====================================================

interface IconBadgeProps {
  settings: WeddingSettings
  children: ReactNode
  size?: Size
  variant?: BadgeVariant
  shape?: Shape
  className?: string
}

export function IconBadge({
  settings,
  children,
  size = 'md',
  variant = 'soft',
  shape = 'rounded',
  className = '',
}: IconBadgeProps) {
  const styles = getAdaptiveStyles(settings)

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const shapeMap = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    square: 'rounded-lg',
  }

  return (
    <div
      className={`${sizeMap[size]} ${shapeMap[shape]} flex items-center justify-center flex-shrink-0 ${className}`}
      style={styles.badge[variant]}
    >
      {children}
    </div>
  )
}

// =====================================================
// THEME PILL (badge text)
// =====================================================

interface ThemePillProps {
  settings: WeddingSettings
  children: ReactNode
  variant?: BadgeVariant
  size?: Size
  className?: string
}

export function ThemePill({
  settings,
  children,
  variant = 'solid',
  size = 'md',
  className = '',
}: ThemePillProps) {
  const styles = getAdaptiveStyles(settings)

  const sizeMap = {
    sm: 'text-[10px] px-2.5 py-1',
    md: 'text-xs px-3.5 py-1.5',
    lg: 'text-sm px-4 py-2',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${sizeMap[size]} ${className}`}
      style={styles.badge[variant]}
    >
      {children}
    </span>
  )
}

// =====================================================
// THEME BUTTON
// =====================================================

interface ThemeButtonProps {
  settings: WeddingSettings
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  className?: string
  style?: CSSProperties
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function ThemeButton({
  settings,
  children,
  variant = 'primary',
  onClick,
  className = '',
  style,
  disabled = false,
  type = 'button',
}: ThemeButtonProps) {
  const styles = getAdaptiveStyles(settings)
  const variantStyle = styles.button[variant]

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-full font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{ ...variantStyle, ...style }}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
    >
      {children}
    </motion.button>
  )
}

// =====================================================
// SOFT BOX
// =====================================================

interface SoftBoxProps {
  settings: WeddingSettings
  children: ReactNode
  className?: string
  style?: CSSProperties
  solid?: boolean
}

export function SoftBox({
  settings,
  children,
  className = '',
  style,
  solid = false,
}: SoftBoxProps) {
  const styles = getAdaptiveStyles(settings)
  const boxStyle = solid ? styles.box.solid : styles.box.soft

  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ ...boxStyle, ...style }}
    >
      {children}
    </div>
  )
}

// =====================================================
// THEME DIVIDER
// =====================================================

interface ThemeDividerProps {
  settings: WeddingSettings
  className?: string
  gradient?: boolean
}

export function ThemeDivider({
  settings,
  className = '',
  gradient = false,
}: ThemeDividerProps) {
  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)

  if (gradient) {
    return (
      <div
        className={`h-px w-full ${className}`}
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        }}
      />
    )
  }

  return (
    <div className={`h-px w-full ${className}`} style={styles.divider} />
  )
}

// =====================================================
// THEME TEXT
// =====================================================

interface ThemeTextProps {
  settings: WeddingSettings
  children: ReactNode
  level?: 'primary' | 'secondary' | 'muted' | 'subtle'
  className?: string
  style?: CSSProperties
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span'
}

export function ThemeText({
  settings,
  children,
  level = 'primary',
  className = '',
  style,
  as: Tag = 'p',
}: ThemeTextProps) {
  const styles = getAdaptiveStyles(settings)

  return (
    <Tag
      className={className}
      style={{ color: styles.text[level], ...style }}
    >
      {children}
    </Tag>
  )
}

// =====================================================
// CORNER ACCENTS
// =====================================================

interface CornerAccentsProps {
  settings: WeddingSettings
  size?: number
}

export function CornerAccents({ settings, size = 16 }: CornerAccentsProps) {
  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)
  const borderColor = `${colors.accent}${styles.isDark ? '60' : '50'}`

  return (
    <>
      <div
        className="absolute top-3 left-3 border-t border-l"
        style={{ width: size, height: size, borderColor }}
      />
      <div
        className="absolute top-3 right-3 border-t border-r"
        style={{ width: size, height: size, borderColor }}
      />
      <div
        className="absolute bottom-3 left-3 border-b border-l"
        style={{ width: size, height: size, borderColor }}
      />
      <div
        className="absolute bottom-3 right-3 border-b border-r"
        style={{ width: size, height: size, borderColor }}
      />
    </>
  )
}

// =====================================================
// ORNAMENT DIVIDER
// =====================================================

interface OrnamentDividerProps {
  settings: WeddingSettings
  className?: string
}

export function OrnamentDivider({
  settings,
  className = '',
}: OrnamentDividerProps) {
  const colors = getThemeColors(settings)

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className="w-12 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.primary})`,
        }}
      />
      <div
        className="w-1.5 h-1.5 rotate-45"
        style={{ backgroundColor: colors.primary }}
      />
      <div
        className="w-12 h-px"
        style={{
          background: `linear-gradient(270deg, transparent, ${colors.primary})`,
        }}
      />
    </div>
  )
}