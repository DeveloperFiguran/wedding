'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { adminUpload, adminDeleteFile } from '@/lib/admin-api'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SafeImage } from '@/components/ui/SafeImage'
import { copyToClipboard } from '@/lib/utils'
import {
  Upload, Copy, Check, Trash2,
  FolderOpen, Loader2,
  Images as ImagesIcon, Music, Play, Pause,
  FileAudio, Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'

const BUCKET = 'wedding-files'
const MAX_FILE_SIZE_MB = 10
const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const ALLOWED_AUDIO_EXTS = ['mp3']
const ALLOWED_EXTS = [...ALLOWED_IMAGE_EXTS, ...ALLOWED_AUDIO_EXTS]

// Magic bytes untuk validasi client-side (fast fail sebelum upload)
const MAGIC_BYTES: Record<string, number[][]> = {
  jpg: [[0xFF, 0xD8, 0xFF]],
  jpeg: [[0xFF, 0xD8, 0xFF]],
  png: [[0x89, 0x50, 0x4E, 0x47]],
  gif: [[0x47, 0x49, 0x46, 0x38]],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  mp3: [
    [0x49, 0x44, 0x33],
    [0xFF, 0xFB],
    [0xFF, 0xF3],
    [0xFF, 0xF2],
  ],
}

interface MediaFile {
  name: string
  id: string
  created_at: string
  url: string
  fileType: 'image' | 'audio'
}

type FilterType = 'all' | 'image' | 'audio'

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file: MediaFile | null }>({
    open: false,
    file: null,
  })
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchMedia()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  /* ============================================
     CLIENT-SIDE VALIDATION (fast fail)
     ============================================ */
  async function validateFileSecurity(file: File): Promise<string | null> {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `Ukuran maksimal ${MAX_FILE_SIZE_MB}MB`
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXTS.includes(fileExt)) {
      return `Ekstensi tidak diizinkan. Gunakan: ${ALLOWED_EXTS.join(', ')}`
    }

    try {
      const buffer = await file.slice(0, 12).arrayBuffer()
      const bytes = new Uint8Array(buffer)

      const signatures = MAGIC_BYTES[fileExt] || []
      const isValidSignature = signatures.some((sig) =>
        sig.every((byte, i) => bytes[i] === byte)
      )

      if (!isValidSignature) {
        return 'Konten file tidak sesuai dengan ekstensinya'
      }
    } catch {
      return 'Gagal membaca file'
    }

    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return 'Nama file mengandung karakter tidak valid'
    }

    return null
  }

  function getFileType(filename: string): 'image' | 'audio' {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return ALLOWED_AUDIO_EXTS.includes(ext) ? 'audio' : 'image'
  }

  /* ============================================
     FETCH MEDIA (pakai public client, bucket public)
     ============================================ */
  async function fetchMedia() {
    setLoading(true)
    try {
      // Pakai supabase (anon key) karena bucket public, list() butuh auth tapi pakai anon key cukup
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list('', {
          limit: 200,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error

      const filesWithUrl: MediaFile[] = (data || [])
        .filter((file) => file.name && !file.name.startsWith('.'))
        .map((file) => {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(file.name)
          return {
            name: file.name,
            id: file.id || file.name,
            created_at: file.created_at || '',
            url: urlData.publicUrl,
            fileType: getFileType(file.name),
          }
        })

      setMedia(filesWithUrl)
    } catch (err: any) {
      toast.error(`Gagal memuat media: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /* ============================================
     UPLOAD (pakai adminUpload dari admin-api.ts)
     ============================================ */
  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) {
      toast.error('Tidak ada file yang dipilih')
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const file of fileArray) {
      // Client-side validation (fast fail)
      const securityError = await validateFileSecurity(file)
      if (securityError) {
        errors.push(`${file.name}: ${securityError}`)
        failCount++
        continue
      }

      try {
        // Pakai adminUpload yang otomatis kirim JWT token
        await adminUpload(file)
        successCount++
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err)
        errors.push(`${file.name}: ${err.message}`)
        failCount++
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast.success(`${successCount} file berhasil diupload! 🎉`)
      fetchMedia()
    }
    if (failCount > 0) {
      const errorMsg = errors.slice(0, 3).join('; ')
      toast.error(`${failCount} file gagal: ${errorMsg}${errors.length > 3 ? '...' : ''}`)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
    e.target.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  /* ============================================
     AUDIO PLAYER
     ============================================ */
  const toggleAudio = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play()
      setPlayingAudio(url)

      audio.onended = () => {
        setPlayingAudio(null)
      }
    }
  }

  /* ============================================
     COPY URL
     ============================================ */
  const handleCopyUrl = async (url: string) => {
    await copyToClipboard(url)
    setCopiedUrl(url)
    toast.success('URL berhasil disalin! Tinggal paste di input.')
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  /* ============================================
     DELETE FILE (pakai adminDeleteFile)
     ============================================ */
  const handleDelete = async () => {
    if (!deleteDialog.file) return

    setDeleting(true)
    try {
      await adminDeleteFile(deleteDialog.file.name)
      toast.success('File berhasil dihapus')
      setDeleteDialog({ open: false, file: null })
      fetchMedia()
    } catch (err: any) {
      toast.error(`Gagal menghapus: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredMedia = filter === 'all'
    ? media
    : media.filter((file) => file.fileType === filter)

  const imageCount = media.filter((f) => f.fileType === 'image').length
  const audioCount = media.filter((f) => f.fileType === 'audio').length

  return (
    <div className="space-y-6">
      {/* ====== UPLOAD AREA ====== */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-3xl p-8 md:p-10 text-center cursor-pointer
          transition-all duration-300 bg-white/70 backdrop-blur-sm
          ${dragActive
            ? 'border-[#C9A96E] bg-[#C9A96E]/10 scale-[1.01]'
            : 'border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,audio/mpeg,audio/mp3"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={36} className="text-[#C9A96E] animate-spin" />
            <p className="text-body-md font-medium text-[#6B5B5B]">Mengupload & memvalidasi file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center shadow-lg shadow-[#C9A96E]/30">
              <Upload size={28} className="text-white" />
            </div>
            <p className="text-body-lg font-semibold text-[#3D342B]">
              Klik atau drag & drop file di sini
            </p>
            <p className="text-body-sm text-[#6B5B5B]/60">
              Gambar: JPG, PNG, WEBP, GIF · Musik: MP3 · Maks {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        )}
      </div>

      {/* ====== FILTER & COUNT ====== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-[#C9A96E]" />
          <h3 className="font-display text-lg text-[#3D342B]">Semua File</h3>
          <span className="text-caption bg-[#C9A96E]/10 text-[#B8935A] px-2.5 py-0.5 rounded-full font-semibold">
            {media.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white shadow-md'
                : 'bg-white text-[#6B5B5B] border border-[#C9A96E]/20 hover:bg-[#C9A96E]/5'
            }`}
          >
            Semua ({media.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'image'
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white shadow-md'
                : 'bg-white text-[#6B5B5B] border border-[#C9A96E]/20 hover:bg-[#C9A96E]/5'
            }`}
          >
            <ImageIcon size={14} />
            Gambar ({imageCount})
          </button>
          <button
            onClick={() => setFilter('audio')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'audio'
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white shadow-md'
                : 'bg-white text-[#6B5B5B] border border-[#C9A96E]/20 hover:bg-[#C9A96E]/5'
            }`}
          >
            <Music size={14} />
            Musik ({audioCount})
          </button>
        </div>
      </div>

      {/* ====== FILE GRID ====== */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-[#C9A96E]/10 animate-pulse" />
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-[#C9A96E]/10">
          {filter === 'audio' ? (
            <Music size={48} className="mx-auto text-[#C9A96E]/30 mb-4" />
          ) : filter === 'image' ? (
            <ImagesIcon size={48} className="mx-auto text-[#C9A96E]/30 mb-4" />
          ) : (
            <FolderOpen size={48} className="mx-auto text-[#C9A96E]/30 mb-4" />
          )}
          <p className="text-body-md text-[#6B5B5B]/60 mb-1">
            {filter === 'all' ? 'Belum ada file' : `Belum ada ${filter === 'image' ? 'gambar' : 'musik'}`}
          </p>
          <p className="text-body-sm text-[#6B5B5B]/40">Upload file pertama Anda di area atas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {filteredMedia.map((file, index) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#C9A96E]/10"
              >
                {file.fileType === 'image' ? (
                  <div
                    className="relative aspect-square overflow-hidden cursor-pointer"
                    onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}
                  >
                    <SafeImage
                      src={file.url}
                      alt={file.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="relative aspect-square bg-gradient-to-br from-[#C9A96E]/10 to-[#DCAE96]/20 flex items-center justify-center">
                    <div className="text-center">
                      <button
                        onClick={() => toggleAudio(file.url)}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        {playingAudio === file.url ? (
                          <Pause size={24} className="text-white" />
                        ) : (
                          <Play size={24} className="text-white ml-1" />
                        )}
                      </button>
                      <p className="mt-3 text-caption text-[#6B5B5B]/60 font-medium">
                        {playingAudio === file.url ? 'Sedang diputar...' : 'Klik untuk putar'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    {file.fileType === 'image' ? (
                      <ImageIcon size={12} className="text-[#C9A96E]" />
                    ) : (
                      <FileAudio size={12} className="text-[#C9A96E]" />
                    )}
                    <p className="text-caption text-[#6B5B5B]/50 truncate" title={file.name}>
                      {formatDate(file.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCopyUrl(file.url)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        copiedUrl === file.url
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white hover:shadow-md'
                      }`}
                    >
                      {copiedUrl === file.url ? (
                        <>
                          <Check size={13} />
                          Disalin!
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy URL
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDeleteDialog({ open: true, file })}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Hapus file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ====== INFO ====== */}
      <div className="p-5 bg-gradient-to-r from-[#C9A96E]/10 to-[#DCAE96]/10 rounded-2xl border border-[#C9A96E]/20">
        <h4 className="font-display text-sm text-[#3D342B] mb-2">💡 Cara Menggunakan</h4>
        <ol className="text-body-sm text-[#6B5B5B]/80 space-y-1 list-decimal list-inside">
          <li>Upload gambar atau musik di area atas</li>
          <li>Klik tombol <strong>Copy URL</strong> pada file yang diinginkan</li>
          <li>
            Paste URL di:
            <ul className="ml-6 mt-1 list-disc space-y-0.5">
              <li><strong>Gambar:</strong> Pengaturan (Cover, Hero, Foto), Gallery, Documentary, Love Story</li>
              <li><strong>Musik:</strong> Pengaturan → URL Musik Background</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* ====== DELETE DIALOG ====== */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, file: null })}
        onConfirm={handleDelete}
        title="Hapus File?"
        description="File akan dihapus permanen dari penyimpanan. URL yang sudah dipakai tidak akan berfungsi lagi."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon={<Trash2 size={24} />}
        loading={deleting}
      />
    </div>
  )
}