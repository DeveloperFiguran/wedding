'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  WeddingSettings,
  Wedding,
  WeddingCouple,
  WeddingEvent,
  WeddingGiftAccount,
  WeddingSocialLink,
  WeddingTheme,
  WeddingMedia,
  WeddingSeo,
  WeddingFeature,
  WeddingEventType,
  CoupleRole,
  GiftProviderType,
} from '@/types/database'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SafeImage } from '@/components/ui/SafeImage'
import { ThemePicker } from '@/components/admin/ThemePicker'
import { FontPicker } from '@/components/admin/FontPicker'
import { BackgroundStylePicker } from '@/components/admin/BackgroundStylePicker'
import { ThemePreset } from '@/lib/themes'
import { upsertSingle, saveMultiple } from '@/lib/admin-helpers'
import { isAuthenticated } from '@/lib/admin-api'
import {
  Save, Heart, Calendar, Gift, Palette, Images, Music,
  ToggleRight, Users, MapPin, Clock, Instagram, Hash,
  Link as LinkIcon, Sparkles, AlertCircle, Share2, Info,
  CheckCircle, Plus, Trash2, GripVertical, Facebook,
  Youtube, Twitter
} from 'lucide-react'
import { toast } from 'sonner'
import {
  isValidImageUrl, ValidationErrors, hasErrors
} from '@/lib/validation'
import { isoToDate, dateToISO, localToISO, isoToLocal, TIMEZONE_OPTIONS } from '@/lib/utils'
import { useHydrated } from '@/hooks/useHydrated'

/* ============================================
   IMAGE PREVIEW
   ============================================ */
function ImagePreview({ url }: { url?: string | null }) {
  if (!url) return null
  if (!isValidImageUrl(url)) {
    return (
      <div className="mt-2 relative aspect-video rounded-xl overflow-hidden border border-red-200 bg-red-50/50 flex items-center justify-center">
        <div className="text-center p-3">
          <AlertCircle size={24} className="mx-auto text-red-400 mb-1" />
          <p className="text-xs text-red-500">URL gambar tidak valid</p>
        </div>
      </div>
    )
  }
  return (
    <div className="mt-2 relative aspect-video rounded-xl overflow-hidden border border-[#C9A96E]/20 bg-gray-50">
      <SafeImage src={url} alt="Preview" fill className="object-cover" />
    </div>
  )
}

/* ============================================
   SAVE FOOTER
   ============================================ */
function SaveFooter({
  saving,
  onSend,
  label = 'Simpan Perubahan',
  success,
}: {
  saving: boolean
  onSend: () => void
  label?: string
  success?: boolean
}) {
  return (
    <div className="mt-6 pt-5 border-t border-[#C9A96E]/10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-[#6B5B5B]/60">
        {success ? (
          <>
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-green-600 font-medium">Tersimpan</span>
          </>
        ) : (
          <>
            <Info size={14} />
            <span>Perubahan belum disimpan</span>
          </>
        )}
      </div>
      <Button onClick={onSend} loading={saving} icon={<Save size={16} />} size="sm">
        {label}
      </Button>
    </div>
  )
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function AdminSettings() {
  const hydrated = useHydrated()
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')

  const [savingTab, setSavingTab] = useState<string | null>(null)
  const [successFlags, setSuccessFlags] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Track existing IDs untuk multiple-records tables (untuk delete logic)
  const [existingIds, setExistingIds] = useState<{
    couples: string[]
    events: string[]
    gifts: string[]
    socials: string[]
  }>({ couples: [], events: [], gifts: [], socials: [] })

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/admin/login'
      return
    }
    fetchSettings()
  }, [])

  /* ============================================
     FETCH DATA
     ============================================ */
  async function fetchSettings() {
    try {
      const [
        weddingRes, couplesRes, eventsRes,
        giftAccountsRes, socialLinksRes,
        themeRes, mediaRes, seoRes, featuresRes,
      ] = await Promise.all([
        supabase.from('weddings').select('*').maybeSingle(),
        supabase.from('wedding_couples').select('*').order('created_at'),
        supabase.from('wedding_events').select('*').order('event_date'),
        supabase.from('wedding_gift_accounts').select('*').order('sort_order'),
        supabase.from('wedding_social_links').select('*').order('sort_order'),
        supabase.from('wedding_themes').select('*').maybeSingle(),
        supabase.from('wedding_media').select('*').maybeSingle(),
        supabase.from('wedding_seos').select('*').maybeSingle(),
        supabase.from('wedding_features').select('*').maybeSingle(),
      ])

      const couples = couplesRes.data || []
      const events = eventsRes.data || []
      const gifts = giftAccountsRes.data || []
      const socials = socialLinksRes.data || []

      setSettings({
        wedding: weddingRes.data || createDefaultWedding(),
        bride: couples.find((c) => c.role === 'bride') || null,
        groom: couples.find((c) => c.role === 'groom') || null,
        events,
        gift_accounts: gifts,
        social_links: socials,
        theme: themeRes.data || null,
        media: mediaRes.data || null,
        seo: seoRes.data || null,
        features: featuresRes.data || null,
      })

      setExistingIds({
        couples: couples.map((c) => c.id),
        events: events.map((e) => e.id),
        gifts: gifts.map((g) => g.id),
        socials: socials.map((s) => s.id),
      })
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  function createDefaultWedding(): Wedding {
    const now = new Date().toISOString()
    return {
      id: 'new',
      wedding_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'Asia/Jakarta',
      dresscode: null, quote: null, opening_text: null,
      closing_text: null, hashtag: null,
      created_at: now, updated_at: now,
    }
  }

  const checkAuth = (): boolean => {
    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return false
    }
    return true
  }

  /* ============================================
     UPDATE HELPERS - SINGLE RECORDS
     ============================================ */
  const updateWedding = (field: keyof Wedding, value: any) => {
    setSettings((prev) =>
      prev ? { ...prev, wedding: { ...prev.wedding, [field]: value } } : null
    )
    setSuccessFlags((p) => ({ ...p, info: false }))
  }

  const updateTheme = (field: keyof WeddingTheme, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      if (!prev.theme) {
        const now = new Date().toISOString()
        return {
          ...prev,
          theme: {
            id: 'new',
            primary_color: '#B8935A', accent_color: '#D4A574',
            text_color: '#3D342B', background_color: '#FBF8F3',
            background_style: 'botanical', font_preset: 'classic-elegance',
            hero_image_url: null, cover_background_url: null,
            created_at: now, updated_at: now,
            [field]: value,
          },
        }
      }
      return { ...prev, theme: { ...prev.theme, [field]: value } }
    })
    setSuccessFlags((p) => ({ ...p, theme: false }))
  }

  const updateMedia = (field: keyof WeddingMedia, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      if (!prev.media) {
        const now = new Date().toISOString()
        return {
          ...prev,
          media: {
            id: 'new', music_url: null, live_stream_url: null,
            created_at: now, updated_at: now, [field]: value,
          },
        }
      }
      return { ...prev, media: { ...prev.media, [field]: value } }
    })
    setSuccessFlags((p) => ({ ...p, media: false }))
  }

  const updateSeo = (field: keyof WeddingSeo, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      if (!prev.seo) {
        const now = new Date().toISOString()
        return {
          ...prev,
          seo: {
            id: 'new', meta_title: null, meta_description: null,
            meta_image_url: null, created_at: now, updated_at: now,
            [field]: value,
          },
        }
      }
      return { ...prev, seo: { ...prev.seo, [field]: value } }
    })
    setSuccessFlags((p) => ({ ...p, seo: false }))
  }

  const updateFeatures = (field: keyof WeddingFeature, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      if (!prev.features) {
        const now = new Date().toISOString()
        return {
          ...prev,
          features: {
            id: 'new',
            enable_gallery: true, enable_documentary: true,
            enable_love_story: true, enable_wishes_wall: true,
            enable_music: false, created_at: now, updated_at: now,
            [field]: value,
          },
        }
      }
      return { ...prev, features: { ...prev.features, [field]: value } }
    })
    setSuccessFlags((p) => ({ ...p, features: false }))
  }

  /* ============================================
     UPDATE HELPERS - MULTIPLE RECORDS
     ============================================ */
  // Couples
  const updateCouple = (role: CoupleRole, field: keyof WeddingCouple, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      const key = role === 'bride' ? 'bride' : 'groom'
      const existing = prev[key]
      if (existing) {
        return { ...prev, [key]: { ...existing, [field]: value } }
      } else {
        const now = new Date().toISOString()
        const newCouple: WeddingCouple = {
          id: 'new', role, short_name: '', full_name: '',
          parents: null, photo_url: null,
          created_at: now, updated_at: now,
          [field]: value,
        }
        return { ...prev, [key]: newCouple }
      }
    })
    setSuccessFlags((p) => ({ ...p, couples: false }))
  }

  // Events
  const addEvent = () => {
    setSettings((prev) => {
      if (!prev) return null
      const now = new Date().toISOString()
      const newEvent: WeddingEvent = {
        id: 'new',
        event_type: 'other',
        event_date: null, event_time: null,
        location: null, maps_url: null,
        created_at: now, updated_at: now,
      }
      return { ...prev, events: [...prev.events, newEvent] }
    })
    setSuccessFlags((p) => ({ ...p, events: false }))
  }

  const updateEvent = (index: number, field: keyof WeddingEvent, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      const newEvents = [...prev.events]
      newEvents[index] = { ...newEvents[index], [field]: value }
      return { ...prev, events: newEvents }
    })
    setSuccessFlags((p) => ({ ...p, events: false }))
  }

  const removeEvent = (index: number) => {
    setSettings((prev) => {
      if (!prev) return null
      const newEvents = prev.events.filter((_, i) => i !== index)
      return { ...prev, events: newEvents }
    })
    setSuccessFlags((p) => ({ ...p, events: false }))
  }

  // Gift accounts
  const addGiftAccount = (type: GiftProviderType) => {
    setSettings((prev) => {
      if (!prev) return null
      const now = new Date().toISOString()
      const newAccount: WeddingGiftAccount = {
        id: 'new', provider_type: type,
        bank_name: null, account_number: null,
        account_holder_name: null, qris_url: null,
        sort_order: prev.gift_accounts.length,
        created_at: now, updated_at: now,
      }
      return { ...prev, gift_accounts: [...prev.gift_accounts, newAccount] }
    })
    setSuccessFlags((p) => ({ ...p, gift: false }))
  }

  const updateGiftAccount = (index: number, field: keyof WeddingGiftAccount, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      const newGifts = [...prev.gift_accounts]
      newGifts[index] = { ...newGifts[index], [field]: value }
      return { ...prev, gift_accounts: newGifts }
    })
    setSuccessFlags((p) => ({ ...p, gift: false }))
  }

  const removeGiftAccount = (index: number) => {
    setSettings((prev) => {
      if (!prev) return null
      const newGifts = prev.gift_accounts.filter((_, i) => i !== index)
      return { ...prev, gift_accounts: newGifts }
    })
    setSuccessFlags((p) => ({ ...p, gift: false }))
  }

  // Social links
  const addSocialLink = () => {
    setSettings((prev) => {
      if (!prev) return null
      const now = new Date().toISOString()
      const newLink: WeddingSocialLink = {
        id: 'new', platform: 'instagram',
        username: null, url: null,
        sort_order: prev.social_links.length,
        created_at: now, updated_at: now,
      }
      return { ...prev, social_links: [...prev.social_links, newLink] }
    })
    setSuccessFlags((p) => ({ ...p, social: false }))
  }

  const updateSocialLink = (index: number, field: keyof WeddingSocialLink, value: any) => {
    setSettings((prev) => {
      if (!prev) return null
      const newSocials = [...prev.social_links]
      newSocials[index] = { ...newSocials[index], [field]: value }
      return { ...prev, social_links: newSocials }
    })
    setSuccessFlags((p) => ({ ...p, social: false }))
  }

  const removeSocialLink = (index: number) => {
    setSettings((prev) => {
      if (!prev) return null
      const newSocials = prev.social_links.filter((_, i) => i !== index)
      return { ...prev, social_links: newSocials }
    })
    setSuccessFlags((p) => ({ ...p, social: false }))
  }

  const applyThemePreset = (preset: ThemePreset) => {
    updateTheme('primary_color', preset.primary_color)
    updateTheme('accent_color', preset.accent_color)
    updateTheme('text_color', preset.text_color)
    updateTheme('background_color', preset.background_color)
  }

  /* ============================================
     SAVE FUNCTIONS
     ============================================ */

  // ====== INFO (single) ======
  const saveWedding = async () => {
    if (!settings || !checkAuth()) return
    setSavingTab('info')
    try {
      await upsertSingle('weddings', settings.wedding)
      toast.success('Info pernikahan berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, info: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== COUPLES (2 records: bride + groom) ======
  const saveCouples = async () => {
    if (!settings || !checkAuth()) return

    if (!settings.bride?.short_name || !settings.bride?.full_name) {
      toast.error('Data mempelai wanita belum lengkap')
      return
    }
    if (!settings.groom?.short_name || !settings.groom?.full_name) {
      toast.error('Data mempelai pria belum lengkap')
      return
    }

    setSavingTab('couples')
    try {
      const records = []
      if (settings.bride) records.push(settings.bride)
      if (settings.groom) records.push(settings.groom)

      await saveMultiple('wedding_couples', records, existingIds.couples)

      toast.success('Data mempelai berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, couples: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== EVENTS (multiple) ======
  const saveEvents = async () => {
    if (!settings || !checkAuth()) return
    setSavingTab('events')
    try {
      await saveMultiple('wedding_events', settings.events, existingIds.events)
      toast.success('Detail acara berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, events: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== THEME (single) ======
  const saveTheme = async () => {
    if (!settings?.theme || !checkAuth()) return
    setSavingTab('theme')
    try {
      await upsertSingle('wedding_themes', settings.theme)
      toast.success('Tema berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, theme: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== GIFT (multiple) ======
  const saveGiftAccounts = async () => {
    if (!settings || !checkAuth()) return
    setSavingTab('gift')
    try {
      await saveMultiple('wedding_gift_accounts', settings.gift_accounts, existingIds.gifts)
      toast.success('Amplop digital berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, gift: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== MEDIA (single) ======
  const saveMedia = async () => {
    if (!settings?.media || !checkAuth()) return
    setSavingTab('media')
    try {
      await upsertSingle('wedding_media', settings.media)
      toast.success('Media berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, media: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== SOCIAL (multiple) ======
  const saveSocialLinks = async () => {
    if (!settings || !checkAuth()) return
    setSavingTab('social')
    try {
      await saveMultiple('wedding_social_links', settings.social_links, existingIds.socials)
      toast.success('Media sosial berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, social: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== SEO (single) ======
  const saveSeo = async () => {
    if (!settings?.seo || !checkAuth()) return
    setSavingTab('seo')
    try {
      await upsertSingle('wedding_seos', settings.seo)
      toast.success('SEO berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, seo: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  // ====== FEATURES (single) ======
  const saveFeatures = async () => {
    if (!settings?.features || !checkAuth()) return
    setSavingTab('features')
    try {
      await upsertSingle('wedding_features', settings.features)
      toast.success('Fitur berhasil disimpan!')
      setSuccessFlags((p) => ({ ...p, features: true }))
      fetchSettings()
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setSavingTab(null)
    }
  }

  if (loading) return <LoadingSpinner text="Memuat pengaturan..." />
  if (!settings) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="mx-auto text-red-300 mb-4" />
        <p className="text-[#6B5B5B]/60">Gagal memuat pengaturan</p>
      </div>
    )
  }

  const tabs = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'couples', label: 'Mempelai', icon: Heart },
    { id: 'events', label: 'Acara', icon: Calendar },
    { id: 'theme', label: 'Tema', icon: Palette },
    { id: 'gift', label: 'Amplop', icon: Gift },
    { id: 'media', label: 'Media & Sosmed', icon: Images },
    { id: 'seo', label: 'SEO', icon: Share2 },
    { id: 'features', label: 'Fitur', icon: ToggleRight },
  ]

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
        <LoadingSpinner text="Memuat..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-display text-[#6B5B5B]">Pengaturan</h1>
        <p className="text-sm text-[#6B5B5B]/60 mt-1">Kelola seluruh konten undangan Anda</p>
      </div>

      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-[#C9A96E]/10">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isUnsaved = successFlags[tab.id] === false
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#C9A96E] text-white shadow-md'
                    : 'text-[#6B5B5B]/70 hover:bg-[#C9A96E]/10'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {isUnsaved && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ============ INFO TAB ============ */}
      {activeTab === 'info' && (
        <Card title="Info Pernikahan" subtitle="Tanggal, quote, dan teks utama" icon={<Info size={20} />}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#6B5B5B] mb-2">Timezone</label>
              <select
                value={settings.wedding.timezone || 'Asia/Jakarta'}
                onChange={(e) => updateWedding('timezone', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#C9A96E]/20 bg-white/70"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-gradient-to-r from-[#C9A96E]/5 to-[#DCAE96]/5 rounded-2xl border border-[#C9A96E]/10">
              <p className="text-xs font-semibold text-[#6B5B5B]/70 uppercase tracking-wider mb-3">
                Tanggal Utama (untuk countdown)
              </p>
              <Input
                type="datetime-local"
                value={settings.wedding.wedding_date ? isoToLocal(settings.wedding.wedding_date) : ''}
                onChange={(e) => updateWedding('wedding_date', 
                  e.target.value ? new Date(e.target.value).toISOString() : null
                )}
                icon={<Clock size={16} />}
                required
              />
            </div>

            <Input label="Hashtag Pernikahan" value={settings.wedding.hashtag || ''} onChange={(e) => updateWedding('hashtag', e.target.value)} placeholder="#WanitaAndPria" icon={<Hash size={16} />} />
            <Input label="Dresscode (Opsional)" value={settings.wedding.dresscode || ''} onChange={(e) => updateWedding('dresscode', e.target.value)} placeholder="Warna pastel, sentuhan batik" />
            <Textarea label="Quote / Ayat" value={settings.wedding.quote || ''} onChange={(e) => updateWedding('quote', e.target.value)} placeholder="Dan di antara tanda-tanda kekuasaan-Nya..." rows={3} />
            <Textarea label="Teks Pembuka" value={settings.wedding.opening_text || ''} onChange={(e) => updateWedding('opening_text', e.target.value)} placeholder="Dengan memohon rahmat dan ridho Allah SWT..." rows={3} />
            <Textarea label="Teks Penutup" value={settings.wedding.closing_text || ''} onChange={(e) => updateWedding('closing_text', e.target.value)} placeholder="Merupakan suatu kebahagiaan..." rows={3} />
          </div>
          <SaveFooter saving={savingTab === 'info'} onSend={saveWedding} label="Simpan Info Pernikahan" success={successFlags.info} />
        </Card>
      )}

      {/* ============ COUPLES TAB ============ */}
      {activeTab === 'couples' && (
        <Card title="Informasi Pengantin" subtitle="Data mempelai dan orang tua" icon={<Heart size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BRIDE */}
            <div className="p-4 rounded-2xl border border-[#C9A96E]/20 bg-[#C9A96E]/5">
              <h3 className="font-display text-lg text-[#6B5B5B] mb-4 flex items-center gap-2">
                <Heart size={18} className="text-[#C9A96E]" /> Mempelai Wanita
              </h3>
              <div className="space-y-3">
                <Input label="Nama Panggilan" value={settings.bride?.short_name || ''} onChange={(e) => updateCouple('bride', 'short_name', e.target.value)} placeholder="Wanita" required />
                <Input label="Nama Lengkap" value={settings.bride?.full_name || ''} onChange={(e) => updateCouple('bride', 'full_name', e.target.value)} required />
                <Input label="Orang Tua" value={settings.bride?.parents || ''} onChange={(e) => updateCouple('bride', 'parents', e.target.value)} placeholder="Bapak & Ibu" icon={<Users size={16} />} />
                <Input label="Foto" value={settings.bride?.photo_url || ''} onChange={(e) => updateCouple('bride', 'photo_url', e.target.value)} placeholder="https://..." icon={<LinkIcon size={16} />} />
                <ImagePreview url={settings.bride?.photo_url} />
              </div>
            </div>

            {/* GROOM */}
            <div className="p-4 rounded-2xl border border-[#C9A96E]/20 bg-[#C9A96E]/5">
              <h3 className="font-display text-lg text-[#6B5B5B] mb-4 flex items-center gap-2">
                <Heart size={18} className="text-[#C9A96E]" /> Mempelai Pria
              </h3>
              <div className="space-y-3">
                <Input label="Nama Panggilan" value={settings.groom?.short_name || ''} onChange={(e) => updateCouple('groom', 'short_name', e.target.value)} placeholder="Pria" required />
                <Input label="Nama Lengkap" value={settings.groom?.full_name || ''} onChange={(e) => updateCouple('groom', 'full_name', e.target.value)} required />
                <Input label="Orang Tua" value={settings.groom?.parents || ''} onChange={(e) => updateCouple('groom', 'parents', e.target.value)} placeholder="Bapak & Ibu" icon={<Users size={16} />} />
                <Input label="Foto" value={settings.groom?.photo_url || ''} onChange={(e) => updateCouple('groom', 'photo_url', e.target.value)} placeholder="https://..." icon={<LinkIcon size={16} />} />
                <ImagePreview url={settings.groom?.photo_url} />
              </div>
            </div>
          </div>
          <SaveFooter saving={savingTab === 'couples'} onSend={saveCouples} label="Simpan Data Mempelai" success={successFlags.couples} />
        </Card>
      )}

      {/* ============ EVENTS TAB (multiple) ============ */}
      {activeTab === 'events' && (
        <Card title="Detail Acara" subtitle="Jadwal dan lokasi acara (bisa tambah banyak)" icon={<Calendar size={20} />}>
          <div className="space-y-4">
            {settings.events.map((event, index) => (
              <div key={event.id || index} className="p-4 rounded-2xl border border-[#C9A96E]/20 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-base text-[#6B5B5B] flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#C9A96E] text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    Event {index + 1}
                  </h4>
                  <button
                    onClick={() => removeEvent(index)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                    title="Hapus event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6B5B5B] mb-2">Jenis Acara</label>
                    <select
                      value={event.event_type}
                      onChange={(e) => updateEvent(index, 'event_type', e.target.value as WeddingEventType)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#C9A96E]/20 bg-white"
                    >
                      <option value="akad">Akad Nikah</option>
                      <option value="reception">Resepsi</option>
                      <option value="siraman">Siraman</option>
                      <option value="ngunduh_mantu">Ngunduh Mantu</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <Input 
                    label="Tanggal" 
                    type="date" 
                    value={isoToDate(event.event_date)} 
                    onChange={(e) => updateEvent(index, 'event_date', 
                      e.target.value ? dateToISO(e.target.value) : null
                    )} 
                  />
                  <Input label="Waktu" type="time" value={event.event_time || ''} onChange={(e) => updateEvent(index, 'event_time', e.target.value)} />
                  <Input label="Lokasi" value={event.location || ''} onChange={(e) => updateEvent(index, 'location', e.target.value)} placeholder="Nama tempat" icon={<MapPin size={16} />} />
                  <div className="md:col-span-2">
                    <Input label="Google Maps URL" value={event.maps_url || ''} onChange={(e) => updateEvent(index, 'maps_url', e.target.value)} placeholder="https://maps.google.com/..." icon={<LinkIcon size={16} />} />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addEvent}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-all flex items-center justify-center gap-2 text-[#C9A96E] font-medium"
            >
              <Plus size={18} /> Tambah Event
            </button>
          </div>
          <SaveFooter saving={savingTab === 'events'} onSend={saveEvents} label="Simpan Semua Acara" success={successFlags.events} />
        </Card>
      )}

      {/* ============ THEME TAB ============ */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <Card title="Preset Tema" subtitle="Pilih tema warna siap pakai" icon={<Palette size={20} />}>
            <ThemePicker
              currentColors={{
                primary_color: settings.theme?.primary_color || '#B8935A',
                accent_color: settings.theme?.accent_color || '#D4A574',
                text_color: settings.theme?.text_color || '#3D342B',
                background_color: settings.theme?.background_color || '#FBF8F3',
              }}
              onApply={applyThemePreset}
            />
          </Card>

          <Card title="Kustomisasi Warna & Font" subtitle="Atur warna, font, dan background" icon={<Sparkles size={20} />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ColorPicker label="Primary Color" value={settings.theme?.primary_color || '#B8935A'} onChange={(v) => updateTheme('primary_color', v)} />
                <ColorPicker label="Accent Color" value={settings.theme?.accent_color || '#D4A574'} onChange={(v) => updateTheme('accent_color', v)} />
                <ColorPicker label="Text Color" value={settings.theme?.text_color || '#3D342B'} onChange={(v) => updateTheme('text_color', v)} />
                <ColorPicker label="Background Color" value={settings.theme?.background_color || '#FBF8F3'} onChange={(v) => updateTheme('background_color', v)} />
              </div>

              <FontPicker currentPreset={settings.theme?.font_preset || 'classic-elegance'} onSelect={(id) => updateTheme('font_preset', id)} />
              <BackgroundStylePicker
                currentStyle={settings.theme?.background_style || 'botanical'}
                onSelect={(id) => updateTheme('background_style', id)}
                primaryColor={settings.theme?.primary_color || '#B8935A'}
                accentColor={settings.theme?.accent_color || '#D4A574'}
                backgroundColor={settings.theme?.background_color || '#FBF8F3'}
              />

              <div className="space-y-5">
                <div>
                  <Input label="Cover Background URL" value={settings.theme?.cover_background_url || ''} onChange={(e) => updateTheme('cover_background_url', e.target.value)} placeholder="https://..." icon={<LinkIcon size={16} />} />
                  <ImagePreview url={settings.theme?.cover_background_url} />
                </div>
                <div>
                  <Input label="Hero Image URL" value={settings.theme?.hero_image_url || ''} onChange={(e) => updateTheme('hero_image_url', e.target.value)} placeholder="https://..." icon={<LinkIcon size={16} />} />
                  <ImagePreview url={settings.theme?.hero_image_url} />
                </div>
              </div>
            </div>
            <SaveFooter saving={savingTab === 'theme'} onSend={saveTheme} label="Simpan Tema" success={successFlags.theme} />
          </Card>
        </div>
      )}

      {/* ============ GIFT TAB (multiple) ============ */}
      {activeTab === 'gift' && (
        <Card title="Amplop Digital" subtitle="Rekening dan QRIS (bisa tambah banyak)" icon={<Gift size={20} />}>
          <div className="space-y-4">
            {settings.gift_accounts.map((account, index) => (
              <div key={account.id || index} className="p-4 rounded-2xl border border-[#C9A96E]/20 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-base text-[#6B5B5B] flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#C9A96E] text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {account.provider_type === 'bank' ? 'Rekening Bank' : 'QRIS'}
                  </h4>
                  <button
                    onClick={() => removeGiftAccount(index)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-500"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#6B5B5B] mb-2">Tipe</label>
                    <select
                      value={account.provider_type}
                      onChange={(e) => updateGiftAccount(index, 'provider_type', e.target.value as GiftProviderType)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#C9A96E]/20 bg-white"
                    >
                      <option value="bank">Rekening Bank</option>
                      <option value="qris">QRIS</option>
                    </select>
                  </div>

                  {account.provider_type === 'bank' ? (
                    <>
                      <Input label="Nama Bank" value={account.bank_name || ''} onChange={(e) => updateGiftAccount(index, 'bank_name', e.target.value)} placeholder="BCA, Mandiri, dll" />
                      <Input label="Nomor Rekening" value={account.account_number || ''} onChange={(e) => updateGiftAccount(index, 'account_number', e.target.value)} placeholder="1234567890" />
                      <Input label="Atas Nama" value={account.account_holder_name || ''} onChange={(e) => updateGiftAccount(index, 'account_holder_name', e.target.value)} placeholder="Nama pemilik" />
                    </>
                  ) : (
                    <div className="md:col-span-2">
                      <Input label="URL QRIS" value={account.qris_url || ''} onChange={(e) => updateGiftAccount(index, 'qris_url', e.target.value)} placeholder="https://..." icon={<LinkIcon size={16} />} hint="Upload gambar QRIS di halaman Media" />
                      <ImagePreview url={account.qris_url} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={() => addGiftAccount('bank')}
                className="flex-1 py-3 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-all flex items-center justify-center gap-2 text-[#C9A96E] font-medium"
              >
                <Plus size={18} /> Tambah Bank
              </button>
              <button
                onClick={() => addGiftAccount('qris')}
                className="flex-1 py-3 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-all flex items-center justify-center gap-2 text-[#C9A96E] font-medium"
              >
                <Plus size={18} /> Tambah QRIS
              </button>
            </div>
          </div>
          <SaveFooter saving={savingTab === 'gift'} onSend={saveGiftAccounts} label="Simpan Semua Amplop" success={successFlags.gift} />
        </Card>
      )}

      {/* ============ MEDIA & SOSMED TAB ============ */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Media (single) */}
          <Card title="Media" subtitle="Musik background dan live stream" icon={<Music size={20} />}>
            <div className="space-y-5">
              <Input label="URL Musik Background (MP3)" value={settings.media?.music_url || ''} onChange={(e) => updateMedia('music_url', e.target.value)} placeholder="https://..." icon={<Music size={16} />} hint="Upload MP3 di halaman Media" />
              <Input label="Live Stream URL (Opsional)" value={settings.media?.live_stream_url || ''} onChange={(e) => updateMedia('live_stream_url', e.target.value)} placeholder="https://youtube.com/... atau zoom.us/..." icon={<LinkIcon size={16} />} />
            </div>
            <SaveFooter saving={savingTab === 'media'} onSend={saveMedia} label="Simpan Media" success={successFlags.media} />
          </Card>

          {/* Social links (multiple) */}
          <Card title="Media Sosial" subtitle="Akun sosmed (bisa tambah banyak)" icon={<Instagram size={20} />}>
            <div className="space-y-4">
              {settings.social_links.map((link, index) => (
                <div key={link.id || index} className="p-4 rounded-2xl border border-[#C9A96E]/20 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display text-base text-[#6B5B5B] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#C9A96E] text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      Social Link {index + 1}
                    </h4>
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 hover:bg-red-50 rounded-xl text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#6B5B5B] mb-2">Platform</label>
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-[#C9A96E]/20 bg-white"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="website">Website</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>
                    <Input label="Username / URL" value={link.username || ''} onChange={(e) => updateSocialLink(index, 'username', e.target.value)} placeholder="username atau full URL" icon={<LinkIcon size={16} />} />
                    <div className="md:col-span-2">
                      <Input label="URL Lengkap (Opsional)" value={link.url || ''} onChange={(e) => updateSocialLink(index, 'url', e.target.value)} placeholder="https://instagram.com/username" icon={<LinkIcon size={16} />} />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addSocialLink}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-all flex items-center justify-center gap-2 text-[#C9A96E] font-medium"
              >
                <Plus size={18} /> Tambah Social Link
              </button>
            </div>
            <SaveFooter saving={savingTab === 'social'} onSend={saveSocialLinks} label="Simpan Semua Sosmed" success={successFlags.social} />
          </Card>
        </div>
      )}

      {/* ============ SEO TAB ============ */}
      {activeTab === 'seo' && (
        <Card title="SEO" subtitle="Atur tampilan saat link dibagikan" icon={<Share2 size={20} />}>
          <div className="space-y-5">
            <Input label="Meta Title" value={settings.seo?.meta_title || ''} onChange={(e) => updateSeo('meta_title', e.target.value)} placeholder="Undangan Pernikahan ..." hint={`${(settings.seo?.meta_title || '').length}/60 karakter`} />
            <Textarea label="Meta Description" value={settings.seo?.meta_description || ''} onChange={(e) => updateSeo('meta_description', e.target.value)} placeholder="Kami mengundang Anda..." rows={3} hint={`${(settings.seo?.meta_description || '').length}/160 karakter`} />
            <div>
              <Input label="Meta Image URL (OG Image)" value={settings.seo?.meta_image_url || ''} onChange={(e) => updateSeo('meta_image_url', e.target.value)} placeholder="https://..." icon={<LinkIcon size={16} />} />
              <ImagePreview url={settings.seo?.meta_image_url} />
            </div>
          </div>
          <SaveFooter saving={savingTab === 'seo'} onSend={saveSeo} label="Simpan SEO" success={successFlags.seo} />
        </Card>
      )}

      {/* ============ FEATURES TAB ============ */}
      {activeTab === 'features' && (
        <Card title="Fitur Tambahan" subtitle="Aktifkan/nonaktifkan fitur" icon={<ToggleRight size={20} />}>
          <div className="divide-y divide-[#C9A96E]/10">
            <Toggle label="Gallery" description="Tampilkan section gallery foto" enabled={settings.features?.enable_gallery ?? true} onChange={(v) => updateFeatures('enable_gallery', v)} />
            <Toggle label="Documentary" description="Tampilkan section dokumenter" enabled={settings.features?.enable_documentary ?? true} onChange={(v) => updateFeatures('enable_documentary', v)} />
            <Toggle label="Love Story Timeline" description="Cerita perjalanan cinta" enabled={settings.features?.enable_love_story ?? true} onChange={(v) => updateFeatures('enable_love_story', v)} />
            <Toggle label="Wishes Wall" description="Tampilkan semua ucapan tamu" enabled={settings.features?.enable_wishes_wall ?? true} onChange={(v) => updateFeatures('enable_wishes_wall', v)} />
            <Toggle label="Music Player" description="Musik background otomatis" enabled={settings.features?.enable_music ?? false} onChange={(v) => updateFeatures('enable_music', v)} />
          </div>
          <SaveFooter saving={savingTab === 'features'} onSend={saveFeatures} label="Simpan Fitur" success={successFlags.features} />
        </Card>
      )}
    </div>
  )
}
