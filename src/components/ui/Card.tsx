'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  icon?: ReactNode
  headerAction?: ReactNode
}

export function Card({ children, className = '', title, subtitle, icon, headerAction }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-[#C9A96E]/10 overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className="p-6 border-b border-[#C9A96E]/10 flex items-center justify-between gap-4">
          {(title || subtitle) && (
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A96E]/20 to-[#DCAE96]/20 flex items-center justify-center text-[#C9A96E]">
                  {icon}
                </div>
              )}
              <div>
                {title && <h3 className="font-display text-lg text-[#6B5B5B]">{title}</h3>}
                {subtitle && <p className="text-xs text-[#6B5B5B]/60 mt-0.5">{subtitle}</p>}
              </div>
            </div>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  )
}