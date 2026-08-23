'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  WeddingSettings,
  Guest,
  GalleryImage,
  DocumentaryImage,
  LoveStory,
  WeddingCouple,
} from '@/types/database'
import { CoverPage } from './CoverPage'
import { HeroSection } from './HeroSection'
import { CoupleSection } from './CoupleSection'
import { EventDetails } from './EventDetails'
import { GallerySection } from './GallerySection'
import { DocumentarySection } from './DocumentarySection'
import { WeddingGift } from './WeddingGift'
import { RSVPForm } from './RSVPForm'
import { WishesWall } from './WishesWall'
import { LoveStoryTimeline } from './LoveStoryTimeline'
import { Closing } from './Closing'
import { MusicPlayer } from './MusicPlayer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FallingPetals } from './FallingPetals'
import { ScrollProgress } from './ScrollProgress'
import { SectionNav } from './SectionNav'
import { getFontVariables } from '@/lib/fonts'
import { FontLoader } from '@/components/FontLoader'
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeInstagramUsername,
  sanitizeHashtag,
} from '@/lib/validation'
import {
  getThemeColors,
  getFontPreset,
  getQuote,
  getMusicUrl,
  getHashtag,
  getCoupleNames,
  isFeatureEnabled,
} from '@/lib/wedding-helpers'
import { useHydrated } from '@/hooks/useHydrated'

export function InvitationPage({ code }: { code: string }) {
  const hydrated = useHydrated()
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [documentary, setDocumentary] = useState<DocumentaryImage[]>([])
  const [loveStory, setLoveStory] = useState<LoveStory[]>([])
  const [allWishes, setAllWishes] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchData()
  }, [code])

  function sanitizeWeddingSettings(raw: any): WeddingSettings {
    return {
      wedding: raw.wedding
        ? {
            ...raw.wedding,
            dresscode: sanitizeText(raw.wedding.dresscode || ''),
            quote: sanitizeText(raw.wedding.quote || ''),
            opening_text: sanitizeText(raw.wedding.opening_text || ''),
            closing_text: sanitizeText(raw.wedding.closing_text || ''),
            hashtag: sanitizeHashtag(raw.wedding.hashtag || ''),
          }
        : raw.wedding,
      bride: raw.bride
        ? {
            ...raw.bride,
            short_name: sanitizeText(raw.bride.short_name || ''),
            full_name: sanitizeText(raw.bride.full_name || ''),
            parents: sanitizeText(raw.bride.parents || ''),
            photo_url: sanitizeUrl(raw.bride.photo_url),
          }
        : null,
      groom: raw.groom
        ? {
            ...raw.groom,
            short_name: sanitizeText(raw.groom.short_name || ''),
            full_name: sanitizeText(raw.groom.full_name || ''),
            parents: sanitizeText(raw.groom.parents || ''),
            photo_url: sanitizeUrl(raw.groom.photo_url),
          }
        : null,
      events: (raw.events || []).map((e: any) => ({
        ...e,
        location: sanitizeText(e.location || ''),
        maps_url: sanitizeUrl(e.maps_url),
      })),
      gift_accounts: (raw.gift_accounts || []).map((a: any) => ({
        ...a,
        bank_name: sanitizeText(a.bank_name || ''),
        account_number: sanitizeText(a.account_number || ''),
        account_holder_name: sanitizeText(a.account_holder_name || ''),
        qris_url: sanitizeUrl(a.qris_url),
      })),
      social_links: (raw.social_links || []).map((l: any) => ({
        ...l,
        username:
          l.platform === 'instagram'
            ? sanitizeInstagramUsername(l.username || '')
            : sanitizeText(l.username || ''),
        url: sanitizeUrl(l.url),
      })),
      theme: raw.theme
        ? {
            ...raw.theme,
            hero_image_url: sanitizeUrl(raw.theme.hero_image_url),
            cover_background_url: sanitizeUrl(raw.theme.cover_background_url),
          }
        : null,
      media: raw.media
        ? {
            ...raw.media,
            music_url: sanitizeUrl(raw.media.music_url),
            live_stream_url: sanitizeUrl(raw.media.live_stream_url),
          }
        : null,
      seo: raw.seo
        ? {
            ...raw.seo,
            meta_title: sanitizeText(raw.seo.meta_title || ''),
            meta_description: sanitizeText(raw.seo.meta_description || ''),
            meta_image_url: sanitizeUrl(raw.seo.meta_image_url),
          }
        : null,
      features: raw.features || null,
    }
  }

  function sanitizeGuest(data: any): Guest {
    return {
      ...data,
      name: sanitizeText(data.name || ''),
      wish: sanitizeText(data.wish || ''),
    }
  }

  function sanitizeImageItem(data: any): any {
    return {
      ...data,
      caption: sanitizeText(data.caption || ''),
      title: sanitizeText(data.title || ''),
      image_url: sanitizeUrl(data.image_url),
    }
  }

  function sanitizeStory(data: any): LoveStory {
    return {
      ...data,
      title: sanitizeText(data.title || ''),
      description: sanitizeText(data.description || ''),
      image_url: sanitizeUrl(data.image_url),
    }
  }

  async function fetchData() {
    try {
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle()

      if (guestError || !guestData) {
        setError(true)
        setLoading(false)
        return
      }

      const [
        weddingRes,
        couplesRes,
        eventsRes,
        giftAccountsRes,
        socialLinksRes,
        themeRes,
        mediaRes,
        seoRes,
        featuresRes,
      ] = await Promise.all([
        supabase.from('weddings').select('*').maybeSingle(),
        supabase.from('wedding_couples').select('*'),
        supabase.from('wedding_events').select('*'),
        supabase
          .from('wedding_gift_accounts')
          .select('*')
          .order('sort_order'),
        supabase
          .from('wedding_social_links')
          .select('*')
          .order('sort_order'),
        supabase.from('wedding_themes').select('*').maybeSingle(),
        supabase.from('wedding_media').select('*').maybeSingle(),
        supabase.from('wedding_seos').select('*').maybeSingle(),
        supabase.from('wedding_features').select('*').maybeSingle(),
      ])

      const bride =
        couplesRes.data?.find((c: WeddingCouple) => c.role === 'bride') || null
      const groom =
        couplesRes.data?.find((c: WeddingCouple) => c.role === 'groom') || null

      const rawSettings: WeddingSettings = {
        wedding: weddingRes.data || {
          id: 'default',
          wedding_date: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          ).toISOString(),
          timezone: 'Asia/Jakarta',
          dresscode: null,
          quote: null,
          opening_text: null,
          closing_text: null,
          hashtag: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        bride,
        groom,
        events: eventsRes.data || [],
        gift_accounts: giftAccountsRes.data || [],
        social_links: socialLinksRes.data || [],
        theme: themeRes.data,
        media: mediaRes.data,
        seo: seoRes.data,
        features: featuresRes.data,
      }

      const safeSettings = sanitizeWeddingSettings(rawSettings)
      const safeGuest = sanitizeGuest(guestData)

      const features = {
        gallery: isFeatureEnabled(safeSettings, 'enable_gallery'),
        documentary: isFeatureEnabled(safeSettings, 'enable_documentary'),
        loveStory: isFeatureEnabled(safeSettings, 'enable_love_story'),
        wishesWall: isFeatureEnabled(safeSettings, 'enable_wishes_wall'),
      }

      let galleryData: GalleryImage[] = []
      if (features.gallery) {
        try {
          const { data } = await supabase
            .from('gallery')
            .select('*')
            .order('sort_order')
          galleryData = (data || []).map(sanitizeImageItem)
        } catch (err) {
          console.warn('Gallery fetch failed:', err)
        }
      }

      let documentaryData: DocumentaryImage[] = []
      if (features.documentary) {
        try {
          const { data } = await supabase
            .from('documentary')
            .select('*')
            .order('sort_order')
          documentaryData = (data || []).map(sanitizeImageItem)
        } catch (err) {
          console.warn('Documentary fetch failed:', err)
        }
      }

      let storyData: LoveStory[] = []
      if (features.loveStory) {
        try {
          const { data } = await supabase
            .from('love_story')
            .select('*')
            .order('sort_order')
          storyData = (data || []).map(sanitizeStory)
        } catch (err) {
          console.warn('Love story fetch failed:', err)
        }
      }

      let wishesData: Guest[] = []
      if (features.wishesWall) {
        try {
          const { data } = await supabase
            .from('guests')
            .select('*')
            .not('wish', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50)
          wishesData = (data || []).map(sanitizeGuest)
        } catch (err) {
          console.warn('Wishes fetch failed:', err)
        }
      }

      setSettings(safeSettings)
      setGuest(safeGuest)
      setGallery(galleryData)
      setDocumentary(documentaryData)
      setLoveStory(storyData)
      setAllWishes(wishesData)
      setLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(true)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
        <LoadingSpinner text="Memuat undangan..." />
      </div>
    )
  }

  if (error || !guest || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF8F3] via-[#F7E7CE]/40 to-[#DCAE96]/30 px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#C9A96E]/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] rounded-full flex items-center justify-center shadow-lg shadow-[#C9A96E]/30">
            <span className="text-white text-3xl">💌</span>
          </div>
          <h1 className="font-display text-2xl text-[#3D342B] mb-3">
            Undangan Tidak Tersedia
          </h1>
          <p className="text-body-md text-[#6B5B5B]/70 mb-6 leading-relaxed">
            Terjadi kesalahan saat memuat undangan. Silakan coba beberapa saat
            lagi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-[#C9A96E]/30 transition-all duration-300"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const colors = getThemeColors(settings)
  const fontPreset = getFontPreset(settings)
  const quote = getQuote(settings)
  const musicUrl = getMusicUrl(settings)
  const hashtag = getHashtag(settings)
  const names = getCoupleNames(settings)

  const features = {
    loveStory: isFeatureEnabled(settings, 'enable_love_story'),
    gallery: isFeatureEnabled(settings, 'enable_gallery'),
    documentary: isFeatureEnabled(settings, 'enable_documentary'),
    wishesWall: isFeatureEnabled(settings, 'enable_wishes_wall'),
    music: isFeatureEnabled(settings, 'enable_music'),
  }

  // ✅ Compute music active state SEKALI di sini
  const isMusicActive = features.music && !!musicUrl

  // Tunggu hydration selesai sebelum render konten dinamis
  if (!hydrated) {
    return (
      <div
        style={{
          backgroundColor: colors.background,
          ...getFontVariables(fontPreset),
        }}
        className="min-h-screen flex items-center justify-center"
      >
        <LoadingSpinner text="Memuat..." />
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: colors.background,
        ...getFontVariables(fontPreset),
      }}
    >
      <FontLoader presetId={fontPreset} />

      {/* ✅ MusicPlayer - SELALU RENDER (tidak tergantung isOpen) */}
      {/* Agar musik bisa auto-play sejak CoverPage */}
      {isMusicActive && musicUrl && (
        <MusicPlayer
          musicUrl={musicUrl}
          settings={settings}
        />
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          {/* ====== COVER PAGE (sebelum dibuka) ====== */}
          {!isOpen ? (
            <CoverPage
              key="cover"
              settings={settings}
              guest={guest}
              onOpen={() => setIsOpen(true)}
            />
          ) : (
            /* ====== MAIN CONTENT (setelah dibuka) ====== */
            <motion.main
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <ScrollProgress color={colors.primary} />
              <FallingPetals color={colors.accent} count={10} />

              <HeroSection settings={settings} />

              {quote && (
                <section
                  id="quote"
                  className="py-16 px-6 text-center"
                  style={{ backgroundColor: colors.background }}
                >
                  <motion.blockquote
                    className="max-w-xl mx-auto font-elegant text-body-lg italic leading-relaxed font-medium"
                    style={{ color: colors.text, opacity: 0.85 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <span
                      className="font-script text-4xl block mb-4"
                      style={{ color: colors.primary }}
                    >
                      ✦
                    </span>
                    &quot;{quote}&quot;
                  </motion.blockquote>
                </section>
              )}

              <CoupleSection settings={settings} />

              {features.loveStory && loveStory.length > 0 && (
                <LoveStoryTimeline
                  stories={loveStory}
                  primaryColor={colors.primary}
                  accentColor={colors.accent}
                  textColor={colors.text}
                  backgroundColor={colors.background}
                />
              )}

              <EventDetails settings={settings} />

              {features.gallery && gallery.length > 0 && (
                <div id="gallery">
                  <GallerySection
                    images={gallery}
                    primaryColor={colors.primary}
                    textColor={colors.text}
                    backgroundColor={colors.background}
                  />
                </div>
              )}

              {features.documentary && documentary.length > 0 && (
                <DocumentarySection
                  images={documentary}
                  primaryColor={colors.primary}
                  textColor={colors.text}
                  backgroundColor={colors.background}
                />
              )}

              <div id="gift">
                <WeddingGift settings={settings} />
              </div>

              <div id="rsvp">
                <RSVPForm guest={guest} settings={settings} />
              </div>

              {features.wishesWall && allWishes.length > 0 && (
                <WishesWall
                  wishes={allWishes}
                  settings={settings}
                />
              )}

              <Closing settings={settings} />

              <footer
                className={`py-12 text-center ${
                  isMusicActive ? 'pb-44 md:pb-12' : 'pb-32 md:pb-12'
                }`}
                style={{ backgroundColor: colors.background }}
              >
                <p
                  className="text-caption"
                  style={{ color: colors.text, opacity: 0.5 }}
                >
                  Made with ♥ for {names.bride} & {names.groom}
                </p>
                {hashtag && (
                  <p
                    className="font-script text-2xl mt-2"
                    style={{ color: colors.primary }}
                  >
                    {hashtag}
                  </p>
                )}
              </footer>
            </motion.main>
          )}
        </AnimatePresence>
      </Suspense>

      {/* ✅ SectionNav - hanya muncul setelah isOpen = true (saat user eksplor konten) */}
      {isOpen && (
        <SectionNav
          settings={settings}
          enableGallery={features.gallery}
          isMusicActive={isMusicActive}
        />
      )}
    </div>
  )
}