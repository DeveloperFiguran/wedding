'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Music } from 'lucide-react'
import { getAdaptiveStyles, withAlpha } from '@/lib/theme-utils'
import { getThemeColors } from '@/lib/wedding-helpers'
import type { WeddingSettings } from '@/types/database'

interface MusicPlayerProps {
  musicUrl: string
  settings: WeddingSettings
  compact?: boolean // Mode compact untuk integrated panel
}

export function MusicPlayer({
  musicUrl,
  settings,
  compact = false,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasInteractedRef = useRef(false)

  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)

  // ====== INISIALISASI AUDIO ======
  useEffect(() => {
    if (!musicUrl) return

    const audio = new Audio(musicUrl)
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio

    const handleCanPlay = () => {
      setIsLoaded(true)
    }

    const handleError = () => {
      console.error('Failed to load audio:', musicUrl)
    }

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('error', handleError)

    // Coba auto play saat load
    const tryAutoPlay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (err) {
        // Browser block autoplay - akan play saat user interaction
        setShowHint(true)
      }
    }

    // Delay sedikit agar audio siap
    const timer = setTimeout(() => {
      tryAutoPlay()
    }, 500)

    return () => {
      clearTimeout(timer)
      audio.pause()
      audio.src = ''
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audioRef.current = null
    }
  }, [musicUrl])

  // ====== LISTENER USER INTERACTION PERTAMA ======
  // Musik akan play saat user klik/tap di mana saja (termasuk tombol "Buka Undangan")
  useEffect(() => {
    if (!isLoaded || isPlaying || hasInteractedRef.current) return

    const handleFirstInteraction = () => {
      if (hasInteractedRef.current) return
      hasInteractedRef.current = true

      if (audioRef.current && !isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true)
            setShowHint(false)
          })
          .catch((err) => {
            console.error('Play failed on interaction:', err)
          })
      }

      // Cleanup listeners
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [isLoaded, isPlaying])

  // ====== TOGGLE PLAY/PAUSE ======
  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Play failed:', err))
    }
  }

  // Jangan render jika belum siap
  if (!musicUrl || !isLoaded) return null

  // ====== COMPACT MODE (untuk integrated panel) ======
  if (compact) {
    return (
      <motion.button
        onClick={togglePlay}
        className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              boxShadow: `0 2px 8px ${withAlpha(colors.primary, 0.4)}`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          />
        )}
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{
            duration: isPlaying ? 3 : 0,
            repeat: isPlaying ? Infinity : 0,
            ease: 'linear',
          }}
          className="relative z-10"
        >
          {isPlaying ? (
            <Pause size={18} className="text-white" fill="white" />
          ) : (
            <Play
              size={18}
              style={{ color: colors.primary }}
              fill={colors.primary}
            />
          )}
        </motion.div>
      </motion.button>
    )
  }

  // ====== DEFAULT MODE (standalone floating button) ======
  return (
    <>
      {/* ====== HINT AUTOPLAY BLOCKED ====== */}
      {/* <AnimatePresence>
        {showHint && !isPlaying && (
          <motion.div
            // ✅ Posisi hint di atas music button, di atas SectionNav
            className="fixed bottom-36 right-6 z-[60] pointer-events-none md:hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div
              className="rounded-full px-4 py-2 shadow-lg"
              style={{
                backgroundColor: styles.isDark
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${withAlpha(colors.primary, 0.2)}`,
              }}
            >
              <p
                className="text-xs flex items-center gap-2 whitespace-nowrap"
                style={{ color: colors.text }}
              >
                <Music size={14} style={{ color: colors.primary }} />
                Klik untuk putar musik
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* ====== MUSIC PLAYER BUTTON ====== */}
      <motion.button
        onClick={togglePlay}
        // ✅ FIXED: Posisi di atas SectionNav (bottom-24 = 96px)
        // SectionNav tinggi ~64px + safe area
        className="fixed bottom-24 right-6 z-[60] group md:hidden"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Pause musik' : 'Play musik'}
      >
        {/* Pulse ring saat playing */}
        {isPlaying && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: colors.primary }}
              animate={{
                scale: [1, 1.8],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: colors.accent }}
              animate={{
                scale: [1, 1.8],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Main button */}
        <div
          className="relative w-14 h-14 rounded-full shadow-xl overflow-hidden border-2"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            borderColor: styles.isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(255, 255, 255, 0.4)',
            boxShadow: `0 8px 24px ${withAlpha(colors.primary, 0.4)}`,
          }}
        >
          {/* Spinning disc effect saat playing */}
          <motion.div
            className="absolute inset-0"
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 8,
              repeat: isPlaying ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <div className="absolute inset-1.5 rounded-full border border-white/20" />
            <div className="absolute inset-3 rounded-full border border-white/15" />
            <div className="absolute inset-[18px] rounded-full border border-white/10" />
          </motion.div>

          {/* Center icon */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Pause size={20} className="text-white" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play
                    size={20}
                    className="text-white ml-0.5"
                    fill="currentColor"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating music notes saat playing */}
        <AnimatePresence>
          {isPlaying && (
            <>
              <motion.div
                className="absolute -top-2 -right-1 pointer-events-none"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -20],
                  x: [0, 5],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                <Music size={14} style={{ color: colors.primary }} />
              </motion.div>
              <motion.div
                className="absolute -top-1 -left-2 pointer-events-none"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -15],
                  x: [0, -5],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
              >
                <Music size={12} style={{ color: colors.accent }} />
              </motion.div>
              <motion.div
                className="absolute -top-3 left-3 pointer-events-none"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -18],
                  x: [0, 2],
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 1.5 }}
              >
                <Music size={10} style={{ color: colors.primary }} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}