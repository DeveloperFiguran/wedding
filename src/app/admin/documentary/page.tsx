'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { DocumentaryImage, WeddingSettings } from '@/types/database'
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
  Film, Plus, Trash2, AlertCircle, X,
  Edit3, PlayCircle, Clapperboard, Link as LinkIcon
} from 'lucide-react'
import { toast } from 'sonner'
import {
  isRequired,
  validateUrl,
  maxLength,
  ValidationErrors,
  hasErrors,
  isValidImageUrl,
} from '@/lib/validation'

export default function AdminDocumentary() {
  const [images, setImages] = useState<DocumentaryImage[]>([])
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<DocumentaryImage | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    item: DocumentaryImage | null
  }>({
    open: false,
    item: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    caption: '',
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
      const [docRes, featuresRes] = await Promise.all([
        supabase
          .from('documentary')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase.from('wedding_features').select('*').maybeSingle(),
      ])

      if (docRes.error) throw docRes.error
      if (featuresRes.error) throw featuresRes.error

      setImages(docRes.data || [])

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
    setFormData({ image_url: '', title: '', caption: '' })
    setErrors({})
    setEditingItem(null)
    setShowModal(true)
  }

  const openEditModal = (item: DocumentaryImage) => {
    setFormData({
      image_url: item.image_url,
      title: item.title || '',
      caption: item.caption || '',
    })
    setErrors({})
    setEditingItem(item)
    setShowModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const requiredError = isRequired(formData.image_url, 'URL Gambar')
    if (requiredError) newErrors.image_url = requiredError
    else {
      const urlError = validateUrl(formData.image_url, 'URL Gambar')
      if (urlError) newErrors.image_url = urlError
    }

    const titleError = maxLength(formData.title, 100)
    if (titleError) newErrors.title = titleError

    const captionError = maxLength(formData.caption, 300)
    if (captionError) newErrors.caption = captionError

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
        image_url: formData.image_url.trim(),
        title: formData.title.trim() || null,
        caption: formData.caption.trim() || null,
      }

      if (editingItem) {
        await adminUpdate('documentary', editingItem.id, payload)
        toast.success('Dokumenter berhasil diupdate!')
      } else {
        await adminInsert('documentary', {
          ...payload,
          sort_order: images.length + 1,
        })
        toast.success('Dokumenter berhasil ditambahkan!')
      }

      setShowModal(false)
      setFormData({ image_url: '', title: '', caption: '' })
      setErrors({})
      setEditingItem(null)
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
    if (!deleteDialog.item) return

    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return
    }

    setDeleting(true)
    try {
      await adminDelete('documentary', deleteDialog.item.id)
      toast.success('Dokumenter berhasil dihapus')
      setDeleteDialog({ open: false, item: null })
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

  if (loading) return <LoadingSpinner text="Memuat documentary..." />

  // Cek apakah feature documentary disabled
  if (settings && !settings.features?.enable_documentary) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-100 flex items-center justify-center">
            <AlertCircle className="text-amber-500" size={36} />
          </div>
          <h2 className="text-2xl font-display text-[#6B5B5B] mb-3">
            Documentary Dinonaktifkan
          </h2>
          <p className="text-sm text-[#6B5B5B]/60 mb-6">
            Aktifkan Documentary di halaman Pengaturan untuk mengelola konten.
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
            Documentary
          </h1>
          <p className="text-sm text-[#6B5B5B]/60 mt-1">
            Cerita visual perjalanan cinta kalian
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />} size="lg">
          Tambah Dokumenter
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
      {images.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#C9A96E]/10 flex items-center justify-center">
            <Clapperboard className="text-[#C9A96E]" size={36} />
          </div>
          <h3 className="text-xl font-display text-[#6B5B5B] mb-2">
            Belum Ada Dokumenter
          </h3>
          <p className="text-sm text-[#6B5B5B]/60 mb-6">
            Tambahkan cerita visual untuk mengundang tamu mengenal perjalanan
            kalian
          </p>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>
            Tambah Dokumenter Pertama
          </Button>
        </Card>
      ) : (
        /* Documentary List */
        <div className="space-y-4">
          <AnimatePresence>
            {images.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#C9A96E]/10"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                    <SafeImage
                      src={item.image_url}
                      alt={item.title || 'Documentary'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-[#C9A96E] shadow-lg">
                      {index + 1}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <PlayCircle size={28} className="text-[#C9A96E]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-display text-lg text-[#6B5B5B] flex-1">
                          {item.title || 'Tanpa Judul'}
                        </h3>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 hover:bg-[#C9A96E]/10 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-[#C9A96E]"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({ open: true, item })
                            }
                            className="p-2 hover:bg-red-50 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {item.caption ? (
                        <p className="text-sm text-[#6B5B5B]/70 line-clamp-2">
                          {item.caption}
                        </p>
                      ) : (
                        <p className="text-sm text-[#6B5B5B]/30 italic">
                          Tanpa deskripsi
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
                      {editingItem ? 'Edit Dokumenter' : 'Tambah Dokumenter'}
                    </h3>
                    <p className="text-xs text-[#6B5B5B]/60 mt-1">
                      {editingItem
                        ? 'Perbarui detail dokumenter'
                        : 'Tambahkan konten baru'}
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
                    label="URL Gambar"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://..."
                    icon={<LinkIcon size={16} />}
                    required
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

                  <Input
                    label="Judul"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="The Proposal, Engagement, dll"
                    icon={<Film size={16} />}
                    error={errors.title}
                    hint="Maksimal 100 karakter"
                  />

                  <Textarea
                    label="Caption / Deskripsi"
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData({ ...formData, caption: e.target.value })
                    }
                    placeholder="Ceritakan momen ini..."
                    rows={3}
                    error={errors.caption}
                    hint="Maksimal 300 karakter"
                  />
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
                    {editingItem ? 'Simpan' : 'Tambah'}
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
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Hapus Dokumenter?"
        description="Dokumenter akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon={<Trash2 size={24} />}
        loading={deleting}
      />
    </div>
  )
}