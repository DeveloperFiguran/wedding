// src/lib/theme-utils.ts

import type { CSSProperties } from 'react'
import { getThemeColors } from '@/lib/wedding-helpers'
import type { WeddingSettings } from '@/types/database'

// ✅ RE-EXPORT getThemeColors agar bisa di-import dari sini
export { getThemeColors }

// =====================================================
// TYPES
// =====================================================

export interface AdaptiveColors {
  primary: string
  accent: string
  text: string
  background: string
}

export interface AdaptiveStyles {
  isDark: boolean
  colors: AdaptiveColors

  card: {
    solid: CSSProperties
    glass: CSSProperties
    elevated: CSSProperties
    outline: CSSProperties
  }

  box: {
    soft: CSSProperties
    solid: CSSProperties
  }

  text: {
    primary: string
    secondary: string
    muted: string
    subtle: string
  }

  button: {
    primary: CSSProperties
    secondary: CSSProperties
    ghost: CSSProperties
  }

  badge: {
    solid: CSSProperties
    soft: CSSProperties
    outline: CSSProperties
  }

  divider: CSSProperties
}

// =====================================================
// COLOR UTILITIES
// =====================================================

/**
 * Hitung luminance dari hex color (0 = dark, 1 = light)
 */
export function getLuminance(hexColor: string): number {
  if (!hexColor || typeof hexColor !== 'string') return 0.5
  const hex = hexColor.replace('#', '')
  if (hex.length < 6) return 0.5
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/**
 * Cek apakah color termasuk dark
 */
export function isBackgroundDark(hexColor: string): boolean {
  return getLuminance(hexColor) < 0.5
}

/**
 * Hex ke rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`
  const h = hex.replace('#', '')
  if (h.length < 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Tambah alpha ke hex color
 * Contoh: withAlpha('#B8935A', 0.2) -> '#B8935A33'
 */
export function withAlpha(hex: string, alpha: number): string {
  if (!hex || typeof hex !== 'string') return '#00000000'
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length < 6) return hex
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return `#${cleanHex}${alphaHex}`
}

// =====================================================
// MAIN: Generate Adaptive Styles
// =====================================================

/**
 * Generate semua adaptive styles dari WeddingSettings atau colors.
 */
export function getAdaptiveStyles(
  input: WeddingSettings | AdaptiveColors
): AdaptiveStyles {
  // Detect apakah input WeddingSettings atau AdaptiveColors
  const isWeddingSettings =
    typeof input === 'object' && input !== null && 'wedding' in input

  const colors: AdaptiveColors = isWeddingSettings
    ? getThemeColors(input as WeddingSettings)
    : (input as AdaptiveColors)

  const isDark = isBackgroundDark(colors.background)

  // ============ CARD ============
  const card = {
    solid: {
      backgroundColor: isDark ? hexToRgba(colors.text, 0.06) : '#FFFFFF',
      border: `1px solid ${withAlpha(colors.primary, isDark ? 0.2 : 0.15)}`,
      boxShadow: isDark
        ? '0 8px 32px rgba(0,0,0,0.3)'
        : `0 8px 32px ${withAlpha(colors.primary, 0.12)}`,
    } as CSSProperties,

    glass: {
      backgroundColor: isDark
        ? hexToRgba(colors.text, 0.08)
        : 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${withAlpha(colors.primary, isDark ? 0.2 : 0.15)}`,
      boxShadow: isDark
        ? '0 8px 32px rgba(0,0,0,0.2)'
        : `0 8px 32px ${withAlpha(colors.primary, 0.1)}`,
    } as CSSProperties,

    elevated: {
      backgroundColor: isDark ? hexToRgba(colors.text, 0.1) : '#FFFFFF',
      border: `1px solid ${withAlpha(colors.primary, isDark ? 0.25 : 0.2)}`,
      boxShadow: isDark
        ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${withAlpha(colors.accent, 0.15)} inset`
        : `0 20px 40px ${withAlpha(colors.primary, 0.15)}, 0 0 0 1px ${withAlpha(colors.primary, 0.08)} inset`,
    } as CSSProperties,

    outline: {
      backgroundColor: 'transparent',
      border: `2px dashed ${withAlpha(colors.primary, isDark ? 0.4 : 0.3)}`,
    } as CSSProperties,
  }

  // ============ BOX ============
  const box = {
    soft: {
      backgroundColor: withAlpha(colors.primary, isDark ? 0.12 : 0.06),
      border: `1px solid ${withAlpha(colors.primary, isDark ? 0.25 : 0.15)}`,
    } as CSSProperties,

    solid: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    } as CSSProperties,
  }

  // ============ TEXT ============
  const text = {
    primary: colors.text,
    secondary: hexToRgba(colors.text, 0.75),
    muted: hexToRgba(colors.text, 0.5),
    subtle: hexToRgba(colors.text, 0.35),
  }

  // ============ BUTTON ============
  const button = {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      color: '#FFFFFF',
      boxShadow: `0 4px 14px ${withAlpha(colors.primary, 0.4)}`,
    } as CSSProperties,

    secondary: {
      backgroundColor: 'transparent',
      border: `2px solid ${colors.primary}`,
      color: colors.primary,
    } as CSSProperties,

    ghost: {
      backgroundColor: withAlpha(colors.primary, isDark ? 0.1 : 0.06),
      color: colors.primary,
      border: 'none',
    } as CSSProperties,
  }

  // ============ BADGE ============
  const badge = {
    solid: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      color: '#FFFFFF',
      boxShadow: `0 2px 8px ${withAlpha(colors.primary, 0.3)}`,
    } as CSSProperties,

    soft: {
      backgroundColor: withAlpha(colors.primary, isDark ? 0.2 : 0.12),
      color: colors.primary,
      border: `1px solid ${withAlpha(colors.primary, isDark ? 0.35 : 0.25)}`,
    } as CSSProperties,

    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `1.5px solid ${colors.primary}`,
    } as CSSProperties,
  }

  // ============ DIVIDER ============
  const divider = {
    backgroundColor: withAlpha(colors.primary, isDark ? 0.25 : 0.2),
  } as CSSProperties

  return {
    isDark,
    colors,
    card,
    box,
    text,
    button,
    badge,
    divider,
  }
}

/**
 * Helper cepat untuk cek dark theme
 */
export function isDarkTheme(settings: WeddingSettings): boolean {
  const colors = getThemeColors(settings)
  return isBackgroundDark(colors.background)
}