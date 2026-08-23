'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Guest, WeddingSettings } from '@/types/database'
import { supabase } from '@/lib/supabase'
import {
  Send, Check, Users, MessageCircleHeart,
  Heart, UserX, UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { getThemeColors } from '@/lib/wedding-helpers'
import { getAdaptiveStyles, withAlpha, hexToRgba } from '@/lib/theme-utils'
import {
  ThemeCard,
  AccentIconBox,
  ThemeButton,
  ThemeText,
  SoftBox,
  OrnamentDivider,
} from '@/components/ui/ThemeCard'

interface RSVPFormProps {
  guest: Guest
  settings: WeddingSettings
}

export function RSVPForm({ guest, settings }: RSVPFormProps) {
  const [rsvpStatus, setRsvpStatus] = useState<string>(guest.rsvp_status || '')
  const [rsvpCount, setRsvpCount] = useState(guest.rsvp_count || 1)
  const [wish, setWish] = useState(guest.wish || '')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(!!guest.rsvp_status)

  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)

  // ✅ Adaptive style untuk form inputs
  const getInputStyle = (): React.CSSProperties => ({
    backgroundColor: styles.isDark
      ? hexToRgba(colors.text, 0.06)
      : '#FFFFFF',
    border: `2px solid ${withAlpha(colors.primary, styles.isDark ? 0.3 : 0.25)}`,
    color: styles.text.primary,
  })

  const getSelectStyle = (): React.CSSProperties => ({
    backgroundColor: styles.isDark
      ? hexToRgba(colors.text, 0.06)
      : '#FFFFFF',
    border: `2px solid ${withAlpha(colors.primary, styles.isDark ? 0.3 : 0.25)}`,
    color: styles.text.primary,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.primary)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    paddingRight: '3rem',
    appearance: 'none',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rsvpStatus) {
      toast.error('Pilih status kehadiran Anda')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('guests')
        .update({
          rsvp_status: rsvpStatus as 'hadir' | 'tidak_hadir',
          rsvp_count: rsvpStatus === 'hadir' ? rsvpCount : 0,
          wish: wish || null,
        })
        .eq('id', guest.id)

      if (error) throw error
      setSubmitted(true)
      toast.success('RSVP berhasil disimpan! Terima kasih 🙏')
    } catch (err) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="rsvp"
      className="py-24 px-6"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ThemeText
            settings={settings}
            level="secondary"
            className="text-xs uppercase tracking-[0.4em] mb-4 font-medium"
            style={{ color: colors.primary }}
          >
            RSVP
          </ThemeText>
          <ThemeText
            settings={settings}
            as="h2"
            className="font-display text-4xl md:text-5xl mb-4"
          >
            Konfirmasi Kehadiran
          </ThemeText>
          <OrnamentDivider settings={settings} />
        </motion.div>

        {/* Success State */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <ThemeCard
              key="success"
              settings={settings}
              variant="solid"
              padding="lg"
              animated
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="flex justify-center mb-4"
              >
                <AccentIconBox settings={settings} size="lg" shape="circle">
                  <Check size={28} />
                </AccentIconBox>
              </motion.div>
              <ThemeText
                settings={settings}
                as="h3"
                className="font-display text-2xl md:text-3xl mb-2"
              >
                Terima Kasih!
              </ThemeText>
              <ThemeText
                settings={settings}
                level="muted"
                className="text-sm max-w-md mx-auto"
              >
                Konfirmasi kehadiran Anda telah kami terima. Doa restu Anda
                adalah hadiah terindah bagi kami.
              </ThemeText>
              {rsvpStatus === 'hadir' && (
                <div
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={styles.badge.soft}
                >
                  <UserCheck size={14} />
                  <span className="text-xs font-semibold">
                    {rsvpCount} tamu akan hadir
                  </span>
                </div>
              )}
            </ThemeCard>
          ) : (
            /* Form */
            <ThemeCard
              key="form"
              settings={settings}
              variant="solid"
              padding="lg"
              animated
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status Kehadiran */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AccentIconBox settings={settings} size="sm">
                      <Heart size={14} />
                    </AccentIconBox>
                    <ThemeText
                      settings={settings}
                      className="text-sm font-semibold"
                    >
                      Apakah Anda akan hadir?
                    </ThemeText>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Hadir Button */}
                    <button
                      type="button"
                      onClick={() => setRsvpStatus('hadir')}
                      className="py-4 px-4 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        border: `2px solid ${
                          rsvpStatus === 'hadir'
                            ? colors.primary
                            : withAlpha(colors.text, 0.2)
                        }`,
                        backgroundColor:
                          rsvpStatus === 'hadir'
                            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                            : 'transparent',
                        background:
                          rsvpStatus === 'hadir'
                            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                            : 'transparent',
                        color:
                          rsvpStatus === 'hadir'
                            ? '#FFFFFF'
                            : styles.text.primary,
                        boxShadow:
                          rsvpStatus === 'hadir'
                            ? `0 4px 14px ${withAlpha(colors.primary, 0.4)}`
                            : 'none',
                      }}
                    >
                      <UserCheck size={16} />
                      Hadir
                    </button>

                    {/* Tidak Hadir Button */}
                    <button
                      type="button"
                      onClick={() => setRsvpStatus('tidak_hadir')}
                      className="py-4 px-4 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        border: `2px solid ${
                          rsvpStatus === 'tidak_hadir'
                            ? colors.accent
                            : withAlpha(colors.text, 0.2)
                        }`,
                        backgroundColor:
                          rsvpStatus === 'tidak_hadir'
                            ? colors.accent
                            : 'transparent',
                        color:
                          rsvpStatus === 'tidak_hadir'
                            ? '#FFFFFF'
                            : styles.text.primary,
                        boxShadow:
                          rsvpStatus === 'tidak_hadir'
                            ? `0 4px 14px ${withAlpha(colors.accent, 0.4)}`
                            : 'none',
                      }}
                    >
                      <UserX size={16} />
                      Tidak Hadir
                    </button>
                  </div>
                </div>

                {/* Jumlah Tamu (muncul saat "Hadir" dipilih) */}
                <AnimatePresence>
                  {rsvpStatus === 'hadir' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AccentIconBox settings={settings} size="sm">
                          <Users size={14} />
                        </AccentIconBox>
                        <ThemeText
                          settings={settings}
                          className="text-sm font-semibold"
                        >
                          Jumlah tamu (termasuk Anda)
                        </ThemeText>
                      </div>
                      <select
                        value={rsvpCount}
                        onChange={(e) => setRsvpCount(Number(e.target.value))}
                        className="w-full px-4 py-4 rounded-2xl outline-none transition-all focus:ring-2"
                        style={getSelectStyle()}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} orang
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ucapan & Doa */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AccentIconBox settings={settings} size="sm">
                      <MessageCircleHeart size={14} />
                    </AccentIconBox>
                    <ThemeText
                      settings={settings}
                      className="text-sm font-semibold"
                    >
                      Ucapan & Doa
                    </ThemeText>
                  </div>
                  <textarea
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..."
                    className="w-full px-4 py-4 rounded-2xl outline-none resize-none min-h-[120px] transition-all focus:ring-2"
                    style={getInputStyle()}
                    rows={4}
                  />
                  <ThemeText
                    settings={settings}
                    level="subtle"
                    className="text-[10px] mt-2 text-right"
                  >
                    {wish.length}/500 karakter
                  </ThemeText>
                </div>

                {/* Submit Button */}
                <ThemeButton
                  settings={settings}
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full !py-4 !text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Kirim RSVP
                    </>
                  )}
                </ThemeButton>
              </form>
            </ThemeCard>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}