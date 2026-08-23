'use client'

import { motion } from 'framer-motion'

interface ToggleProps {
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}

export function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-[#C9A96E]/5 transition-colors">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-[#6B5B5B]">{label}</p>
        {description && (
          <p className="text-xs text-[#6B5B5B]/50 mt-0.5">{description}</p>
        )}
      </div>
      <motion.button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-colors duration-300 flex-shrink-0 ${
          enabled 
            ? 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96]' 
            : 'bg-gray-200'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ left: enabled ? '28px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  )
}