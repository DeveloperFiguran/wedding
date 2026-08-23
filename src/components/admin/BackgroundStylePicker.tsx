'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { useState } from 'react'

export interface BackgroundStylePreset {
  id: string
  name: string
  description: string
  icon: string
  category: 'nature' | 'geometric' | 'texture' | 'artistic' | 'minimal' | 'cultural' | 'abstract'
}

export const BACKGROUND_STYLES: BackgroundStylePreset[] = [
  { id: 'botanical', name: 'Botanical', description: 'Daun & floral natural', icon: '🌿', category: 'nature' },
  { id: 'floral-garden', name: 'Floral Garden', description: 'Bunga taman mekar', icon: '🌸', category: 'nature' },
  { id: 'tropical-leaves', name: 'Tropical Leaves', description: 'Daun tropis lebat', icon: '🍃', category: 'nature' },
  { id: 'cloud-sky', name: 'Cloud Sky', description: 'Awan langit lembut', icon: '☁️', category: 'nature' },
  { id: 'ocean-waves', name: 'Ocean Waves', description: 'Ombak laut tenang', icon: '🌊', category: 'nature' },
  { id: 'starry-night', name: 'Starry Night', description: 'Bintang malam romantis', icon: '✨', category: 'nature' },
  { id: 'geometric', name: 'Geometric', description: 'Pola geometris modern', icon: '◇', category: 'geometric' },
  { id: 'art-deco', name: 'Art Deco', description: 'Art deco klasik 1920an', icon: '⬖', category: 'geometric' },
  { id: 'hexagon-grid', name: 'Hexagon Grid', description: 'Grid heksagon futuristik', icon: '⬡', category: 'geometric' },
  { id: 'triangle-mosaic', name: 'Triangle Mosaic', description: 'Mosaik segitiga dinamis', icon: '△', category: 'geometric' },
  { id: 'circular-ripple', name: 'Circular Ripple', description: 'Lingkaran riak konsisten', icon: '◉', category: 'geometric' },
  { id: 'marble', name: 'Marble', description: 'Tekstur marmer elegan', icon: '⬜', category: 'texture' },
  { id: 'rustic-wood', name: 'Rustic Wood', description: 'Kayu rustic alami', icon: '🪵', category: 'texture' },
  { id: 'kraft-paper', name: 'Kraft Paper', description: 'Kertas kraft vintage', icon: '📜', category: 'texture' },
  { id: 'silk-fabric', name: 'Silk Fabric', description: 'Sutra halus berkilau', icon: '🎀', category: 'texture' },
  { id: 'linen-weave', name: 'Linen Weave', description: 'Anyaman linen natural', icon: '🧵', category: 'texture' },
  { id: 'concrete-stone', name: 'Concrete Stone', description: 'Beton industrial modern', icon: '🪨', category: 'texture' },
  { id: 'watercolor', name: 'Watercolor', description: 'Cat air lembut', icon: '🎨', category: 'artistic' },
  { id: 'ink-brush', name: 'Ink Brush', description: 'Kuas tinta ekspresif', icon: '🖌️', category: 'artistic' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Lukisan minyak klasik', icon: '🖼️', category: 'artistic' },
  { id: 'sketch-line', name: 'Sketch Line', description: 'Sketsa garis tangan', icon: '✏️', category: 'artistic' },
  { id: 'abstract-splash', name: 'Abstract Splash', description: 'Splash abstrak warna', icon: '💫', category: 'artistic' },
  { id: 'minimalist', name: 'Minimalist', description: 'Bersih & sederhana', icon: '◻', category: 'minimal' },
  { id: 'dot-pattern', name: 'Dot Pattern', description: 'Titik-titik halus', icon: '⠿', category: 'minimal' },
  { id: 'line-grid', name: 'Line Grid', description: 'Grid garis tipis', icon: '▦', category: 'minimal' },
  { id: 'ornate', name: 'Ornate', description: 'Ornamen klasik mewah', icon: '❦', category: 'cultural' },
  { id: 'baroque', name: 'Baroque', description: 'Baroque megah Eropa', icon: '🏛️', category: 'cultural' },
  { id: 'arabesque', name: 'Arabesque', description: 'Arabesque timur tengah', icon: '🕌', category: 'cultural' },
  { id: 'batik-indonesia', name: 'Batik Indonesia', description: 'Batik tradisional Indonesia', icon: '🇮🇩', category: 'cultural' },
  { id: 'gradient-mesh', name: 'Gradient Mesh', description: 'Gradien modern lembut', icon: '🌈', category: 'abstract' },
  { id: 'aurora-glow', name: 'Aurora Glow', description: 'Aurora bercahaya magis', icon: '🌌', category: 'abstract' },
  { id: 'bokeh-lights', name: 'Bokeh Lights', description: 'Bokeh cahaya romantis', icon: '💡', category: 'abstract' },
]

export const BACKGROUND_CATEGORIES = [
  { id: 'all', name: 'Semua' },
  { id: 'nature', name: 'Nature' },
  { id: 'geometric', name: 'Geometric' },
  { id: 'texture', name: 'Texture' },
  { id: 'artistic', name: 'Artistic' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'cultural', name: 'Cultural' },
  { id: 'abstract', name: 'Abstract' },
]

// ====== HELPER: Generate preview style ======
function getPreviewStyle(styleId: string, primary: string, accent: string): React.CSSProperties {
  switch (styleId) {
    case 'botanical':
    case 'floral-garden':
    case 'tropical-leaves':
      return {
        backgroundImage: `
          radial-gradient(ellipse 8px 20px at 25% 30%, ${accent}50 0%, transparent 100%),
          radial-gradient(ellipse 8px 20px at 45% 45%, ${accent}40 0%, transparent 100%),
          radial-gradient(ellipse 8px 20px at 65% 25%, ${primary}40 0%, transparent 100%),
          linear-gradient(135deg, ${primary}15 0%, transparent 50%)
        `,
      }

    case 'cloud-sky':
      return {
        backgroundImage: `
          radial-gradient(ellipse 50% 30% at 30% 40%, ${accent}40 0%, transparent 100%),
          radial-gradient(ellipse 40% 25% at 70% 60%, ${accent}30 0%, transparent 100%)
        `,
      }

    case 'ocean-waves':
      return {
        backgroundImage: `
          repeating-radial-gradient(circle at 50% 120%, transparent 0px, transparent 8px, ${primary}25 8px, ${primary}25 10px)
        `,
      }

    case 'starry-night':
      return {
        backgroundImage: `
          radial-gradient(circle 1.5px at 20% 30%, ${primary} 100%, transparent),
          radial-gradient(circle 1px at 50% 20%, ${primary} 100%, transparent),
          radial-gradient(circle 1.5px at 80% 40%, ${primary} 100%, transparent),
          radial-gradient(circle 1px at 35% 70%, ${primary} 100%, transparent),
          radial-gradient(circle 1px at 65% 80%, ${primary} 100%, transparent)
        `,
      }

    case 'geometric':
      return {
        backgroundImage: `
          linear-gradient(30deg, ${primary}30 12%, transparent 12.5%, transparent 87%, ${primary}30 87.5%)
        `,
        backgroundSize: '24px 42px',
      }

    case 'art-deco':
      return {
        backgroundImage: `
          repeating-linear-gradient(45deg, ${primary}25, ${primary}25 2px, transparent 2px, transparent 12px),
          repeating-linear-gradient(-45deg, ${accent}25, ${accent}25 2px, transparent 2px, transparent 12px)
        `,
      }

    case 'hexagon-grid':
    case 'triangle-mosaic':
      return {
        backgroundImage: `
          linear-gradient(60deg, ${primary}20 25%, transparent 25.5%),
          linear-gradient(-60deg, ${accent}20 25%, transparent 25.5%)
        `,
        backgroundSize: '24px 42px',
      }

    case 'circular-ripple':
      return {
        backgroundImage: `
          repeating-radial-gradient(circle at 50% 50%, transparent 0px, transparent 6px, ${primary}30 6px, ${primary}30 7px)
        `,
      }

    case 'marble':
    case 'concrete-stone':
      return {
        backgroundImage: `
          radial-gradient(ellipse at 30% 30%, ${primary}20 0%, transparent 50%),
          radial-gradient(ellipse at 70% 70%, ${accent}20 0%, transparent 50%),
          linear-gradient(135deg, ${primary}08 0%, ${accent}08 100%)
        `,
      }

    case 'rustic-wood':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 12px, ${primary}15 12px, ${primary}15 13px)`,
      }

    case 'kraft-paper':
    case 'linen-weave':
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, ${primary}10 3px, ${primary}10 4px)`,
      }

    case 'silk-fabric':
      return {
        backgroundImage: `linear-gradient(120deg, ${primary}25 0%, transparent 30%, ${accent}25 60%, transparent 90%)`,
      }

    case 'watercolor':
    case 'oil-painting':
    case 'abstract-splash':
      return {
        backgroundImage: `
          radial-gradient(circle 30px at 25% 30%, ${primary}35 0%, transparent 100%),
          radial-gradient(circle 35px at 75% 70%, ${accent}30 0%, transparent 100%)
        `,
      }

    case 'ink-brush':
    case 'sketch-line':
      return {
        backgroundImage: `
          linear-gradient(90deg, transparent 48%, ${primary}40 49%, ${primary}40 51%, transparent 52%)
        `,
        backgroundSize: '100% 30px',
      }

    case 'minimalist':
      return {
        backgroundImage: `
          linear-gradient(${primary}40, ${primary}40),
          linear-gradient(${primary}40, ${primary}40)
        `,
        backgroundSize: '1px 20px, 20px 1px',
        backgroundPosition: 'center top, left center',
        backgroundRepeat: 'no-repeat',
      }

    case 'dot-pattern':
      return {
        backgroundImage: `radial-gradient(${primary}60 1px, transparent 1px)`,
        backgroundSize: '10px 10px',
      }

    case 'line-grid':
      return {
        backgroundImage: `
          linear-gradient(${primary}30 1px, transparent 1px),
          linear-gradient(90deg, ${primary}30 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px',
      }

    case 'ornate':
    case 'baroque':
      return {
        backgroundImage: `
          radial-gradient(circle 3px at 50% 20%, ${primary}50 100%, transparent),
          radial-gradient(circle 2px at 35% 30%, ${accent}50 100%, transparent),
          radial-gradient(circle 2px at 65% 30%, ${accent}50 100%, transparent),
          radial-gradient(ellipse 40% 8% at 50% 80%, ${primary}25 0%, transparent 100%)
        `,
      }

    case 'arabesque':
    case 'batik-indonesia':
      return {
        backgroundImage: `
          linear-gradient(45deg, transparent 45%, ${primary}35 45%, ${primary}35 55%, transparent 55%),
          linear-gradient(-45deg, transparent 45%, ${accent}35 45%, ${accent}35 55%, transparent 55%)
        `,
        backgroundSize: '20px 20px',
      }

    case 'gradient-mesh':
      return {
        backgroundImage: `
          radial-gradient(at 0% 0%, ${primary}35 0px, transparent 50%),
          radial-gradient(at 100% 100%, ${accent}30 0px, transparent 50%)
        `,
      }

    case 'aurora-glow':
      return {
        backgroundImage: `
          radial-gradient(ellipse 80% 40% at 20% 30%, ${primary}40 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 70%, ${accent}35 0%, transparent 60%)
        `,
      }

    case 'bokeh-lights':
      return {
        backgroundImage: `
          radial-gradient(circle 8px at 20% 30%, ${primary}40 100%, transparent),
          radial-gradient(circle 12px at 60% 60%, ${accent}35 100%, transparent),
          radial-gradient(circle 6px at 80% 25%, ${primary}40 100%, transparent),
          radial-gradient(circle 10px at 40% 80%, ${accent}30 100%, transparent)
        `,
      }

    default:
      return {
        backgroundImage: `linear-gradient(135deg, ${primary}15 0%, ${accent}15 100%)`,
      }
  }
}

interface BackgroundStylePickerProps {
  currentStyle: string
  onSelect: (styleId: string) => void
  primaryColor?: string
  accentColor?: string
  backgroundColor?: string
}

export function BackgroundStylePicker({
  currentStyle,
  onSelect,
  primaryColor = '#B8935A',
  accentColor = '#D4A574',
  backgroundColor = '#FBF8F3',
}: BackgroundStylePickerProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredStyles = activeCategory === 'all'
    ? BACKGROUND_STYLES
    : BACKGROUND_STYLES.filter((s) => s.category === activeCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#6B5B5B]">
        <Sparkles size={18} className="text-[#C9A96E]" />
        <p className="text-body-sm">
          Pilih gaya background ({BACKGROUND_STYLES.length} pilihan)
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {BACKGROUND_CATEGORIES.map((cat) => (
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
        {filteredStyles.map((style, index) => {
          const isCurrent = currentStyle === style.id
          const previewStyle = getPreviewStyle(style.id, primaryColor, accentColor)

          return (
            <motion.button
              key={style.id}
              onClick={() => onSelect(style.id)}
              className={`relative rounded-2xl p-3 border-2 text-left transition-all duration-300 ${
                isCurrent
                  ? 'border-[#C9A96E] bg-[#C9A96E]/5 shadow-lg shadow-[#C9A96E]/20'
                  : 'border-[#C9A96E]/10 hover:border-[#C9A96E]/40 hover:shadow-md bg-white/50'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCurrent && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C9A96E] rounded-full flex items-center justify-center shadow-md z-10">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* ====== VISUAL PREVIEW (CSS langsung) ====== */}
              <div
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-black/5 mb-2 flex items-center justify-center"
                style={{
                  backgroundColor: backgroundColor,
                  ...previewStyle,
                }}
              >
                {/* Label overlay untuk visibility */}
                <span
                  className="text-2xl"
                  style={{
                    fontFamily: "'Great Vibes', cursive",
                    color: primaryColor,
                    textShadow: '0 1px 3px rgba(255,255,255,0.8)',
                  }}
                >
                  {style.icon}
                </span>
              </div>

              <h4 className="font-display text-sm font-semibold text-[#3D342B] mb-1">
                {style.name}
              </h4>
              <p className="text-caption text-[#6B5B5B]/60">
                {style.description}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
