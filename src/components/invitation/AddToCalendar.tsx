'use client'

import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCalendarProps {
  title: string
  startDate: string
  endDate?: string
  location?: string | null
  primaryColor: string
}

export function AddToCalendar({ title, startDate, endDate, location, primaryColor }: AddToCalendarProps) {
  const handleClick = () => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 3 * 60 * 60 * 1000)

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '')

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(start)}/${formatDate(end)}&location=${encodeURIComponent(location || '')}`

    window.open(googleUrl, '_blank')
    toast.success('Membuka Google Calendar...')
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 active:scale-95"
      style={{
        backgroundColor: `${primaryColor}15`,
        color: primaryColor,
        border: `1px solid ${primaryColor}40`,
      }}
    >
      <CalendarPlus size={14} />
      Simpan Tanggal
    </button>
  )
}