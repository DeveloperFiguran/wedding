'use client'

import { motion } from 'framer-motion'
import { Check, Palette } from 'lucide-react'
import { useState } from 'react'
import { THEME_PRESETS, THEME_CATEGORIES, ThemePreset, findThemeByColors } from '@/lib/themes'

interface ThemePickerProps {
  currentColors: {
    primary_color: string
    accent_color: string
    text_color: string
    background_color: string
  }
  onApply: (preset: ThemePreset) => void
}

export function ThemePicker({ currentColors, onApply }: ThemePickerProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const currentTheme = findThemeByColors(currentColors)

  const filteredThemes = activeCategory === 'all'
    ? THEME_PRESETS
    : THEME_PRESETS.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#6B5B5B]">
        <Palette size={18} className="text-[#C9A96E]" />
        <p className="text-body-sm">
          Pilih tema warna siap pakai ({THEME_PRESETS.length} pilihan)
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {THEME_CATEGORIES.map((cat) => (
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredThemes.map((theme, index) => {
          const isCurrentTheme = currentTheme?.id === theme.id

          return (
            <motion.button
              key={theme.id}
              onClick={() => onApply(theme)}
              className={`relative rounded-2xl p-4 border-2 text-left transition-all duration-300 ${
                isCurrentTheme
                  ? 'border-[#C9A96E] shadow-lg shadow-[#C9A96E]/20'
                  : 'border-[#C9A96E]/10 hover:border-[#C9A96E]/40 hover:shadow-md'
              }`}
              style={{ backgroundColor: theme.background_color }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCurrentTheme && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C9A96E] rounded-full flex items-center justify-center shadow-md">
                  <Check size={14} className="text-white" />
                </div>
              )}

              <div className="flex gap-1.5 mb-3">
                <div
                  className="w-8 h-8 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.primary_color }}
                />
                <div
                  className="w-8 h-8 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.accent_color }}
                />
                <div
                  className="w-8 h-8 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.text_color }}
                />
              </div>

              <h4 className="font-display text-sm font-semibold" style={{ color: theme.text_color }}>
                {theme.name}
              </h4>
              <p className="text-caption mt-0.5" style={{ color: theme.text_color, opacity: 0.6 }}>
                {theme.description}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
