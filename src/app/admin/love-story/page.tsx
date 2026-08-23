'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { LoveStory, WeddingSettings } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SafeImage } from '@/components/ui/SafeImage'
import {
  adminInsert,
  adminUpdate,
  adminDelete,
  isAuthenticated,
} from '@/lib/admin-api'
import {
  BookOpen, Plus, Trash2, AlertCircle, X,
  Edit3, Heart, Calendar, Link as LinkIcon
} from 'lucide-react'
import { toast } from 'sonner'
import {
  isRequired,
  validateUrl,
  validateDate,
  maxLength,
  ValidationErrors,
  hasErrors,
  isValidImageUrl,
} from '@/lib/validation'

export default function AdminLoveStory() {
  const [stories, setStories] = useState<LoveStory[]>([])
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStory, setEditingStory] = useState<LoveStory | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    story: LoveStory | null
  }>({
    open: false,
    story: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image_url: '',
  })

  useEffect(() => {
    // Cek auth dulu
    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return
    }
    fetchData()
  }, [])

  /* ============================================
     FETCH DATA (dari tabel normalized)
     ============================================ */
  async function fetchData() {
    try {
      const [storyRes, featuresRes] = await Promise.all([
        supabase
          .from('love_story')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase.from('wedding_features').select('*').maybeSingle(),
      ])

      if (storyRes.error) throw storyRes.error
      if (featuresRes.error) throw featuresRes.error

      setStories(storyRes.data || [])

      // Build WeddingSettings dengan hanya features (yang dibutuhkan di page ini)
      const weddingSettings: WeddingSettings = {
        wedding: {
          id: 'temp',
          wedding_date: new Date().toISOString(),
          timezone: 'Asia/Jakarta',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        bride: null,
        groom: null,
        events: [],
        gift_accounts: [],
        social_links: [],
        theme: null,
        media: null,
        seo: null,
        features: featuresRes.data,
      }

      setSettings(weddingSettings)
    } catch (err: any) {
      console.error('Fetch error:', err)
      toast.error(`Gagal memuat data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setFormData({ title: '', description: '', date: '', image_url: '' })
    setErrors({})
    setEditingStory(null)
    setShowModal(true)
  }

  const openEditModal = (story: LoveStory) => {
    setFormData({
      title: story.title,
      description: story.description || '',
      date: story.date ? story.date.slice(0, 10) : '',
      image_url: story.image_url || '',
    })
    setErrors({})
    setEditingStory(story)
    setShowModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const titleError = isRequired(formData.title, 'Judul')
    if (titleError) newErrors.title = titleError
    else {
      const titleMaxError = maxLength(formData.title, 100)
      if (titleMaxError) newErrors.title = titleMaxError
    }

    const descError = maxLength(formData.description, 500)
    if (descError) newErrors.description = descError

    if (formData.date) {
      const dateError = validateDate(formData.date, 'Tanggal')
      if (dateError) newErrors.date = dateError
    }

    if (formData.image_url) {
      const urlError = validateUrl(formData.image_url, 'URL Gambar')
      if (urlError) newErrors.image_url = urlError
    }

    setErrors(newErrors)
    return !hasErrors(newErrors)
  }

  /* ============================================
     SAVE (pakai admin API)
     ============================================ */
  const handleSave = async () => {
    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return
    }

    if (!validateForm()) {
      toast.error('Mohon periksa kembali form Anda')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        date: formData.date || null,
        image_url: formData.image_url.trim() || null,
      }

      if (editingStory) {
        await adminUpdate('love_story', editingStory.id, payload)
        toast.success('Love story berhasil diupdate!')
      } else {
        await adminInsert('love_story', {
          ...payload,
          sort_order: stories.length + 1,
        })
        toast.success('Love story berhasil ditambahkan! 💕')
      }

      setShowModal(false)
      setFormData({ title: '', description: '', date: '', image_url: '' })
      setErrors({})
      setEditingStory(null)
      fetchData()
    } catch (err: any) {
      console.error('Save error:', err)
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        toast.error('Session expired. Silakan login ulang.')
        window.location.href = '/admin/login'
      } else {
        toast.error(`Gagal menyimpan: ${err.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  /* ============================================
     DELETE (pakai admin API)
     ============================================ */
  const handleDelete = async () => {
    if (!deleteDialog.story) return

    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return
    }

    setDeleting(true)
    try {
      await adminDelete('love_story', deleteDialog.story.id)
      toast.success('Love story berhasil dihapus')
      setDeleteDialog({ open: false, story: null })
      fetchData()
    } catch (err: any) {
      console.error('Delete error:', err)
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        toast.error('Session expired. Silakan login ulang.')
        window.location.href = '/admin/login'
      } else {
        toast.error(`Gagal menghapus: ${err.message}`)
      }
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner text="Memuat love story..." />

  // Cek apakah feature love_story disabled
  if (settings && !settings.features?.enable_love_story) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-100 flex items-center justify-center">
            <AlertCircle className="text-amber-500" size={36} />
          </div>
          <h2 className="text-2xl font-display text-[#6B5B5B] mb-3">
            Love Story Dinonaktifkan
          </h2>
          <p className="text-sm text-[#6B5B5B]/60 mb-6">
            Aktifkan Love Story di halaman Pengaturan untuk menampilkan timeline
            cerita kalian.
          </p>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/admin/settings')}
          >
            Buka Pengaturan
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display text-[#6B5B5B]">
            Love Story
          </h1>
          <p className="text-sm text-[#6B5B5B]/60 mt-1">
            Timeline perjalanan cinta kalian
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />} size="lg">
          Tambah Story
        </Button>
      </div>

      {/* Info box */}
      <div className="p-4 bg-gradient-to-r from-[#C9A96E]/10 to-[#DCAE96]/10 rounded-2xl border border-[#C9A96E]/20 flex items-start gap-3">
        <AlertCircle
          size={18}
          className="text-[#C9A96E] flex-shrink-0 mt-0.5"
        />
        <div className="text-sm text-[#6B5B5B]/80">
          <strong>Tips:</strong> Upload gambar di halaman{' '}
          <a
            href="/admin/media"
            className="text-[#C9A96E] font-semibold hover:underline"
          >
            Media
          </a>
          , lalu copy URL-nya dan paste di form di bawah ini.
        </div>
      </div>

      {/* Empty State */}
      {stories.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#C9A96E]/10 flex items-center justify-center">
            <BookOpen className="text-[#C9A96E]" size={36} />
          </div>
          <h3 className="text-xl font-display text-[#6B5B5B] mb-2">
            Belum Ada Story
          </h3>
          <p className="text-sm text-[#6B5B5B]/60 mb-6">
            Ceritakan perjalanan cinta kalian kepada para tamu
          </p>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>
            Tambah Story Pertama
          </Button>
        </Card>
      ) : (
        /* Timeline View */
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#C9A96E]/50 via-[#DCAE96]/50 to-transparent hidden md:block"></div>

          <div className="space-y-4">
            <AnimatePresence>
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group md:pl-16"
                >
                  <div className="absolute left-0 top-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] items-center justify-center shadow-lg hidden md:flex">
                    <Heart
                      size={18}
                      className="text-white"
                      fill="currentColor"
                    />
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#C9A96E]/10">
                    <div className="flex flex-col md:flex-row">
                      {story.image_url && story.image_url.trim() !== '' && (
                        <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                          <SafeImage
                            src={story.image_url}
                            alt={story.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 md:hidden">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center">
                                <Heart
                                  size={14}
                                  className="text-white"
                                  fill="currentColor"
                                />
                              </div>
                              <span className="text-xs font-bold text-[#C9A96E]">
                                #{index + 1}
                              </span>
                            </div>

                            {story.date && (
                              <div className="flex items-center gap-2 text-xs text-[#C9A96E] font-semibold uppercase tracking-wider mb-2">
                                <Calendar size={12} />
                                {new Date(story.date).toLocaleDateString(
                                  'id-ID',
                                  {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                )}
                              </div>
                            )}

                            <h3 className="font-display text-xl text-[#6B5B5B] mb-2">
                              {story.title}
                            </h3>

                            {story.description && (
                              <p className="text-sm text-[#6B5B5B]/70 leading-relaxed line-clamp-3">
                                {story.description}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(story)}
                              className="p-2 hover:bg-[#C9A96E]/10 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-[#C9A96E]"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteDialog({ open: true, story })
                              }
                              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl text-[#6B5B5B]">
                      {editingStory ? 'Edit Love Story' : 'Tambah Love Story'}
                    </h3>
                    <p className="text-xs text-[#6B5B5B]/60 mt-1">
                      {editingStory
                        ? 'Perbarui cerita kalian'
                        : 'Ceritakan momen spesial'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={20} className="text-[#6B5B5B]/60" />
                  </button>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Judul Story"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="First Meet, The Proposal, dll"
                    icon={<Heart size={16} />}
                    required
                    error={errors.title}
                    hint="Maksimal 100 karakter"
                  />

                  <Input
                    label="Tanggal Kejadian"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    icon={<Calendar size={16} />}
                    error={errors.date}
                  />

                  <Textarea
                    label="Deskripsi"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Ceritakan momen ini dengan detail..."
                    rows={4}
                    error={errors.description}
                    hint="Maksimal 500 karakter"
                  />

                  <Input
                    label="URL Gambar (Opsional)"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://..."
                    icon={<LinkIcon size={16} />}
                    error={errors.image_url}
                    hint="Copy URL dari halaman Media"
                  />

                  {/* Preview Gambar */}
                  {formData.image_url && (
                    <div>
                      <p className="text-xs font-semibold text-[#6B5B5B]/80 mb-2 uppercase tracking-wider">
                        Preview
                      </p>
                      {isValidImageUrl(formData.image_url) ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#C9A96E]/20 bg-gray-50">
                          <SafeImage
                            src={formData.image_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-red-200 bg-red-50/50 flex items-center justify-center">
                          <div className="text-center p-4">
                            <AlertCircle
                              size={32}
                              className="mx-auto text-red-400 mb-2"
                            />
                            <p className="text-sm text-red-500">
                              URL gambar tidak valid
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    className="flex-1"
                  >
                    {editingStory ? 'Simpan' : 'Tambah Story'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, story: null })}
        onConfirm={handleDelete}
        title="Hapus Love Story?"
        description={`Story "${deleteDialog.story?.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon={<Trash2 size={24} />}
        loading={deleting}
      />
    </div>
  )
}