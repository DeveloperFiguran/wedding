'use client'

import { motion } from 'framer-motion'
import { Check, Type } from 'lucide-react'
import { useState, useEffect } from 'react'
import { FONT_PRESETS, FONT_CATEGORIES } from '@/lib/fonts'

interface FontPickerProps {
  currentPreset: string
  onSelect: (presetId: string) => void
}

/**
 * FontPicker - Admin UI untuk memilih font preset.
 * Self-contained: load fonts sendiri untuk preview grid.
 * Dipakai di: /admin/settings
 */
export function FontPicker({ currentPreset, onSelect }: FontPickerProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [fontsReady, setFontsReady] = useState(false)

  const filteredFonts = activeCategory === 'all'
    ? FONT_PRESETS
    : FONT_PRESETS.filter((f) => f.category === activeCategory)

  /* ============================================
     LOAD FONTS UNTUK PREVIEW (self-contained)
     Load semua fonts yang visible untuk preview grid
     ============================================ */
  useEffect(() => {
    const allFamilies = new Set<string>()

    filteredFonts.forEach((font) => {
      allFamilies.add(`${font.script.replace(/ /g, '+')}:wght@400`)
      allFamilies.add(`${font.display.replace(/ /g, '+')}:wght@400;500;600`)
      allFamilies.add(`${font.elegant.replace(/ /g, '+')}:ital,wght@0,400;1,400`)
      allFamilies.add(`${font.body.replace(/ /g, '+')}:wght@300;400;500`)
    })

    if (allFamilies.size === 0) return

    const fontUrl = `https://fonts.googleapis.com/css2?${Array.from(allFamilies)
      .map((f) => `family=${f}`)
      .join('&')}&display=swap`

    // Hindari duplikat
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`)
    if (!existingLink) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fontUrl
      link.setAttribute('data-font-picker', 'true')
      document.head.appendChild(link)
    }

    // Tunggu fonts ready
    let mounted = true
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted) setFontsReady(true)
      })
    } else {
      setTimeout(() => {
        if (mounted) setFontsReady(true)
      }, 1000)
    }

    return () => {
      mounted = false
    }
  }, [filteredFonts])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#6B5B5B]">
        <Type size={18} className="text-[#C9A96E]" />
        <p className="text-body-sm">
          Pilih kombinasi font ({FONT_PRESETS.length} pilihan)
        </p>
        {!fontsReady && (
          <span className="text-xs text-[#C9A96E] animate-pulse">
            Memuat font...
          </span>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {FONT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white shadow-md'
                : 'bg-white/60 text-[#6B5B5B] border border-[#C9A96E]/20 hover:bg-[#C9A96E]/5'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Font grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredFonts.map((font, index) => {
          const isCurrent = currentPreset === font.id

          return (
            <motion.button
              key={font.id}
              onClick={() => onSelect(font.id)}
              className={`relative rounded-2xl p-5 border-2 text-left transition-all duration-300 ${
                isCurrent
                  ? 'border-[#C9A96E] bg-[#C9A96E]/5 shadow-lg shadow-[#C9A96E]/20'
                  : 'border-[#C9A96E]/10 hover:border-[#C9A96E]/40 hover:shadow-md bg-white/50'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Badge current */}
              {isCurrent && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C9A96E] rounded-full flex items-center justify-center shadow-md">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* Preview 4 baris */}
              <div className="mb-3 pb-3 border-b border-[#C9A96E]/10 min-h-[130px]">
                <p
                  className="text-3xl mb-2 transition-opacity duration-500"
                  style={{
                    fontFamily: `'${font.script}', ${font.scriptFallback}`,
                    color: '#C9A96E',
                    opacity: fontsReady ? 1 : 0.3,
                  }}
                >
                  Wanita & Pria
                </p>
                <p
                  className="text-lg font-semibold mb-1 transition-opacity duration-500"
                  style={{
                    fontFamily: `'${font.display}', ${font.displayFallback}`,
                    color: '#3D342B',
                    opacity: fontsReady ? 1 : 0.5,
                  }}
                >
                  The Wedding
                </p>
                <p
                  className="text-sm italic mb-1 transition-opacity duration-500"
                  style={{
                    fontFamily: `'${font.elegant}', ${font.elegantFallback}`,
                    color: '#6B5B5B',
                    opacity: fontsReady ? 1 : 0.5,
                  }}
                >
                  Kami mengundang Anda
                </p>
                <p
                  className="text-xs transition-opacity duration-500"
                  style={{
                    fontFamily: `'${font.body}', ${font.bodyFallback}`,
                    color: '#8A7F75',
                    opacity: fontsReady ? 1 : 0.5,
                  }}
                >
                  Sabtu, 25 Desember 2025
                </p>
              </div>

              {/* Info */}
              <h4 className="font-display text-sm font-semibold text-[#3D342B] mb-1">
                {font.name}
              </h4>
              <p className="text-caption text-[#6B5B5B]/60">
                {font.description}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
