'use client'

import { motion } from 'framer-motion'
import { WeddingSettings } from '@/types/database'
import { 
  getThemeColors, 
  getClosingText, 
  getCoupleNames 
} from '@/lib/wedding-helpers'
import { Heart } from 'lucide-react'

interface ClosingProps {
  settings: WeddingSettings
}

export function Closing({ settings }: ClosingProps) {
  const colors = getThemeColors(settings)
  const closingText = getClosingText(settings)
  const names = getCoupleNames(settings)

  return (
    <section 
      className="py-24 px-6 text-center" 
      style={{ backgroundColor: colors.background }}
    >
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Heart 
          className="mx-auto mb-6 animate-pulse-soft" 
          size={32} 
          fill={colors.accent}
          style={{ color: colors.accent }} 
        />
        
        {closingText && (
          <p 
            className="font-elegant text-lg italic leading-relaxed mb-4" 
            style={{ color: colors.text }}
          >
            {closingText}
          </p>
        )}

        <div>
          <p className="text-base" style={{ color: colors.text, opacity: 0.8 }}>
            Wassalamualaikum Wr. Wb.
          </p>
          <p className="text-base mt-1" style={{ color: colors.text, opacity: 0.8 }}>
            Kami yang berbahagia,
          </p>
          <p 
            className="font-script text-4xl mt-6" 
            style={{ color: colors.primary }}
          >
            {names.bride} & {names.groom}
          </p>
        </div>
      </motion.div>
    </section>
  )
}