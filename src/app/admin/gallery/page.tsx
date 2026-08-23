'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { GalleryImage, WeddingSettings } from '@/types/database'
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
  Images, Plus, Trash2,
  AlertCircle, X, Edit3, Link as LinkIcon
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

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    image: GalleryImage | null
  }>({
    open: false,
    image: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState({
    image_url: '',
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
      const [galleryRes, featuresRes] = await Promise.all([
        supabase
          .from('gallery')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase.from('wedding_features').select('*').maybeSingle(),
      ])

      if (galleryRes.error) throw galleryRes.error
      if (featuresRes.error) throw featuresRes.error

      setImages(galleryRes.data || [])

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
    setFormData({ image_url: '', caption: '' })
    setErrors({})
    setEditingImage(null)
    setShowModal(true)
  }

  const openEditModal = (image: GalleryImage) => {
    setFormData({
      image_url: image.image_url,
      caption: image.caption || '',
    })
    setErrors({})
    setEditingImage(image)
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

    const captionError = maxLength(formData.caption, 200)
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
        caption: formData.caption.trim() || null,
      }

      if (editingImage) {
        await adminUpdate('gallery', editingImage.id, payload)
        toast.success('Foto berhasil diupdate!')
      } else {
        await adminInsert('gallery', {
          ...payload,
          sort_order: images.length + 1,
        })
        toast.success('Foto berhasil ditambahkan!')
      }

      setShowModal(false)
      setFormData({ image_url: '', caption: '' })
      setErrors({})
      setEditingImage(null)
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
    if (!deleteDialog.image) return

    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return
    }

    setDeleting(true)
    try {
      await adminDelete('gallery', deleteDialog.image.id)
      toast.success('Foto berhasil dihapus')
      setDeleteDialog({ open: false, image: null })
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

  if (loading) return <LoadingSpinner text="Memuat gallery..." />

  // Cek apakah feature gallery disabled
  if (settings && !settings.features?.enable_gallery) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-100 flex items-center justify-center">
            <AlertCircle className="text-amber-500" size={36} />
          </div>
          <h2 className="text-2xl font-display text-[#6B5B5B] mb-3">
            Gallery Dinonaktifkan
          </h2>
          <p className="text-sm text-[#6B5B5B]/60 mb-6">
            Aktifkan Gallery di halaman Pengaturan untuk mengelola foto.
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
            Gallery
          </h1>
          <p className="text-sm text-[#6B5B5B]/60 mt-1">
            Kelola foto-foto pre-wedding dan momen spesial
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />} size="lg">
          Tambah Foto
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
            <Images className="text-[#C9A96E]" size={36} />
          </div>
          <h3 className="text-xl font-display text-[#6B5B5B] mb-2">
            Belum Ada Foto
          </h3>
          <p className="text-sm text-[#6B5B5B]/60 mb-6">
            Mulai tambahkan foto-foto terbaik untuk gallery undangan Anda
          </p>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>
            Tambah Foto Pertama
          </Button>
        </Card>
      ) : (
        /* Gallery Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#C9A96E]/10"
              >
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setPreviewImage(image)}
                >
                  <SafeImage
                    src={image.image_url}
                    alt={image.caption || `Foto ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-[#C9A96E] shadow-lg">
                    {index + 1}
                  </div>
                </div>

                <div className="p-3">
                  {image.caption ? (
                    <p className="text-xs text-[#6B5B5B]/80 line-clamp-2">
                      {image.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-[#6B5B5B]/30 italic">
                      Tanpa caption
                    </p>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => openEditModal(image)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-[#6B5B5B] hover:text-[#C9A96E] hover:scale-110 transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, image })}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-[#6B5B5B] hover:text-red-500 hover:scale-110 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
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
                      {editingImage ? 'Edit Foto' : 'Tambah Foto Baru'}
                    </h3>
                    <p className="text-xs text-[#6B5B5B]/60 mt-1">
                      {editingImage
                        ? 'Perbarui detail foto'
                        : 'Tambahkan foto ke gallery'}
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
                    hint="Copy URL dari halaman Media, atau paste URL gambar publik"
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

                  <Textarea
                    label="Caption (Opsional)"
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData({ ...formData, caption: e.target.value })
                    }
                    placeholder="Momen pre-wedding di Bali..."
                    rows={3}
                    error={errors.caption}
                    hint="Maksimal 200 karakter"
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
                    {editingImage ? 'Simpan Perubahan' : 'Tambah Foto'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <motion.div
              className="max-w-4xl w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <SafeImage
                  src={previewImage.image_url}
                  alt={previewImage.caption || 'Preview'}
                  fill
                  className="object-contain bg-black"
                />
              </div>
              {previewImage.caption && (
                <p className="text-center text-white/90 mt-4 font-elegant italic">
                  {previewImage.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, image: null })}
        onConfirm={handleDelete}
        title="Hapus Foto?"
        description="Foto akan dihapus permanen dari gallery. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon={<Trash2 size={24} />}
        loading={deleting}
      />
    </div>
  )
}