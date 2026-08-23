'use client'

import { useEffect } from 'react'
import { getFontPresetById } from '@/lib/fonts'

interface FontLoaderProps {
  presetId: string
}

/**
 * FontLoader - Load Google Fonts berdasarkan preset.
 * Dipakai di: InvitationPage, LockedCoverPage
 * 
 * Hanya load 1 preset yang aktif (efisien).
 */
export function FontLoader({ presetId }: FontLoaderProps) {
  useEffect(() => {
    if (!presetId) return

    const preset = getFontPresetById(presetId)
    if (!preset) return

    // Build font URL untuk preset ini
    const fontFamilies = [
      `${preset.script.replace(/ /g, '+')}:wght@400`,
      `${preset.display.replace(/ /g, '+')}:wght@400;500;600;700`,
      `${preset.elegant.replace(/ /g, '+')}:ital,wght@0,400;0,500;1,400`,
      `${preset.body.replace(/ /g, '+')}:wght@300;400;500;600`,
    ]

    const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies
      .map((f) => `family=${f}`)
      .join('&')}&display=swap`

    // Cek apakah sudah di-load (hindari duplikat)
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`)
    if (existingLink) return

    // Buat & append link
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontUrl
    link.setAttribute('data-font-loader', presetId)
    document.head.appendChild(link)

    // Cleanup saat unmount
    return () => {
      const links = document.querySelectorAll(`link[data-font-loader="${presetId}"]`)
      if (links.length > 0) {
        links.forEach((l) => l.remove())
      }
    }
  }, [presetId])

  // Component ini tidak render apa-apa
  return null
}
