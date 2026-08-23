'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Petal {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface FallingPetalsProps {
  color?: string
  count?: number
}

export function FallingPetals({ color = '#D4A574', count = 12 }: FallingPetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const generated: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 8 + Math.random() * 12,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.4,
    }))
    setPetals(generated)
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: -30,
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.random() * 100 - 50, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
            <path d="M12 2C12 2 8 8 8 12C8 16 10 20 12 22C14 20 16 16 16 12C16 8 12 2 12 2Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}