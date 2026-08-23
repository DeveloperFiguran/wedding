'use client'

import { useEffect, useMemo, useState } from 'react'
import { useHydrated } from '@/hooks/useHydrated'
import { getCountdownDate } from '@/lib/utils'

interface CountdownProps {
  weddingDate: string
  isDark?: boolean
  timezone?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: Date | null): TimeLeft {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function Countdown({
  weddingDate,
  isDark = false,
  timezone = 'Asia/Jakarta',
}: CountdownProps) {
  const hydrated = useHydrated()

  // ✅ FIX: Gunakan useMemo agar targetDate reference stabil
  // Tidak berubah antara render kecuali weddingDate/timezone berubah
  const targetDate = useMemo(
    () => getCountdownDate(weddingDate, timezone),
    [weddingDate, timezone]
  )

  // State dimulai dari 0 → konsisten di server dan client
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    if (!targetDate) return

    // Hitung timeLeft setelah hydrate (client-side)
    setTimeLeft(calculateTimeLeft(targetDate))

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const items = [
    { value: timeLeft.days, label: 'Hari' },
    { value: timeLeft.hours, label: 'Jam' },
    { value: timeLeft.minutes, label: 'Menit' },
    { value: timeLeft.seconds, label: 'Detik' },
  ]

  const textColor = isDark ? '#FFFFFF' : '#3D342B'
  const subtextColor = isDark ? 'rgba(255,255,255,0.7)' : '#6B5B5B'
  const boxBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'

  return (
    <div
      className="flex justify-center gap-3"
      suppressHydrationWarning={!hydrated}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center px-3 py-2 rounded-2xl backdrop-blur-sm min-w-[64px]"
          style={{ backgroundColor: boxBg }}
        >
          <span
            className="font-display text-2xl md:text-3xl font-bold"
            style={{ color: textColor }}
          >
            {String(item.value).padStart(2, '0')}
          </span>
          <span className="text-xs" style={{ color: subtextColor }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}