'use client'

import { motion } from 'framer-motion'
import { WeddingSettings, WeddingEvent, WeddingEventType } from '@/types/database'
import { MapPin, Clock, Shirt, CalendarHeart } from 'lucide-react'
import { AddToCalendar } from './AddToCalendar'
import { SafeLink } from '@/components/ui/SafeLink'
import { formatTimeSafe, formatDateSafe } from '@/lib/utils'
import { getThemeColors } from '@/lib/wedding-helpers'
import { getAdaptiveStyles, withAlpha } from '@/lib/theme-utils'
import {
  ThemeCard,
  AccentIconBox,
  IconBadge,
  ThemePill,
  ThemeButton,
  ThemeText,
  ThemeDivider,
  OrnamentDivider,
} from '@/components/ui/ThemeCard'
import {
  getAllEvents,
  getDresscode,
  getCoupleNames,
  getTimezone,
} from '@/lib/wedding-helpers'

const EVENT_LABELS: Record<WeddingEventType, string> = {
  akad: 'Akad Nikah',
  reception: 'Resepsi',
  siraman: 'Siraman',
  ngunduh_mantu: 'Ngunduh Mantu',
  other: 'Acara',
}

function EventCard({
  settings,
  event,
  delay,
}: {
  settings: WeddingSettings
  event: WeddingEvent
  delay: number
}) {
  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)
  const names = getCoupleNames(settings)
  const timezone = getTimezone(settings)

  if (!event.event_date) return null

  const label = EVENT_LABELS[event.event_type] || 'Acara'

  return (
    <ThemeCard
      settings={settings}
      variant="elevated"
      delay={delay}
      padding="none"
      hover  // ✅ Tambahkan hover effect
    >
      {/* Header */}
      <div className="p-6 pb-5">
        <div className="flex items-center justify-between mb-4">
          <ThemePill settings={settings} variant="solid" size="sm">
            {label}
          </ThemePill>
          {/* ✅ FIX: Pakai IconBadge untuk konsistensi */}
          <IconBadge settings={settings} variant="soft" size="sm">
            <CalendarHeart size={14} />
          </IconBadge>
        </div>
        <ThemeText
          settings={settings}
          as="h3"
          className="font-display text-xl md:text-2xl font-semibold"
        >
          {formatDateSafe(event.event_date, timezone)}
        </ThemeText>
      </div>

      <ThemeDivider settings={settings} />

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Waktu */}
        {event.event_time && (
          <div className="flex items-center gap-3">
            <AccentIconBox settings={settings} size="sm">
              <Clock size={14} />
            </AccentIconBox>
            <div className="flex-1 min-w-0">
              <ThemeText
                settings={settings}
                level="muted"
                className="text-caption uppercase tracking-wider"
              >
                Waktu
              </ThemeText>
              <ThemeText
                settings={settings}
                className="text-body-sm font-semibold"
              >
                {formatTimeSafe(event.event_time)}
              </ThemeText>
            </div>
          </div>
        )}

        {/* Lokasi */}
        {event.location && (
          <div className="flex items-center gap-3">
            <AccentIconBox settings={settings} size="sm">
              <MapPin size={14} />
            </AccentIconBox>
            <div className="flex-1 min-w-0">
              <ThemeText
                settings={settings}
                level="muted"
                className="text-caption uppercase tracking-wider"
              >
                Lokasi
              </ThemeText>
              <ThemeText
                settings={settings}
                className="text-body-sm font-semibold leading-snug"
              >
                {event.location}
              </ThemeText>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <AddToCalendar
            title={`${label} - ${names.bride} & ${names.groom}`}
            startDate={event.event_date}
            location={event.location || undefined}
            primaryColor={colors.primary}
          />
          {event.maps_url && (
            <SafeLink href={event.maps_url}>
              <ThemeButton settings={settings} variant="primary">
                <MapPin size={14} />
                Lihat Maps
              </ThemeButton>
            </SafeLink>
          )}
        </div>
      </div>
    </ThemeCard>
  )
}

export function EventDetails({ settings }: { settings: WeddingSettings }) {
  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)
  const dresscode = getDresscode(settings)

  const events = getAllEvents(settings)
    .filter((e) => e.event_date)
    .sort((a, b) => {
      const dA = a.event_date ? new Date(a.event_date).getTime() : 0
      const dB = b.event_date ? new Date(b.event_date).getTime() : 0
      return dA - dB
    })

  if (events.length === 0 && !dresscode) return null

  return (
    <section
      id="events"
      className="py-20 px-5"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ThemeText
            settings={settings}
            className="text-label-md uppercase mb-3 font-medium"
            style={{ color: colors.primary }}
          >
            Save The Date
          </ThemeText>
          <ThemeText
            settings={settings}
            as="h2"
            className="font-display text-heading-xl mb-4"
          >
            Rangkaian Acara
          </ThemeText>
          <OrnamentDivider settings={settings} />
        </motion.div>

        {/* Event Cards */}
        {events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                settings={settings}
                event={event}
                delay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          /* Empty state jika tidak ada events tapi ada dresscode */
          <ThemeText
            settings={settings}
            level="subtle"
            className="text-center text-sm italic mb-6"
          >
            Detail acara akan segera diumumkan
          </ThemeText>
        )}

        {/* Dresscode - Premium Style */}
        {dresscode && (
          <ThemeCard
            settings={settings}
            variant="outline"
            className="mt-10 text-center"
            delay={events.length * 0.1 + 0.1}
          >
            {/* ✅ FIX: Pakai AccentIconBox untuk konsistensi */}
            <div className="flex justify-center mb-3">
              <AccentIconBox settings={settings} size="md" shape="circle">
                <Shirt size={20} />
              </AccentIconBox>
            </div>
            <ThemeText
              settings={settings}
              level="muted"
              className="text-caption uppercase tracking-[0.3em] mb-2"
            >
              Dresscode
            </ThemeText>
            <ThemeText
              settings={settings}
              className="text-body-md font-medium"
            >
              {dresscode}
            </ThemeText>
          </ThemeCard>
        )}
      </div>
    </section>
  )
}