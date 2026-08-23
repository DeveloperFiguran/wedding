'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Loader2, Link as LinkIcon, Images } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  bucket?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
}

export function ImageUploader({
  value,
  onChange,
  label,
  bucket = 'wedding-images',
  aspectRatio = 'video',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Gagal upload')

      onChange(data.url)
      setUrlInput(data.url)
      toast.success('Gambar berhasil diupload! 🎉')
    } catch (err: any) {
      toast.error(`Gagal upload: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input agar bisa pilih file yang sama lagi
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
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      toast.success('URL gambar disimpan')
    } else {
      toast.error('Masukkan URL gambar')
    }
  }

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }[aspectRatio]

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-[#6B5B5B]/80 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Toggle mode Upload / URL */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-[#C9A96E] text-white'
              : 'bg-[#C9A96E]/10 text-[#6B5B5B] hover:bg-[#C9A96E]/20'
          }`}
        >
          <Upload size={13} />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === 'url'
              ? 'bg-[#C9A96E] text-white'
              : 'bg-[#C9A96E]/10 text-[#6B5B5B] hover:bg-[#C9A96E]/20'
          }`}
        >
          <LinkIcon size={13} />
          URL
        </button>
      </div>

      {/* Preview gambar */}
      {value && (
        <div className="relative mb-3 rounded-2xl overflow-hidden border-2 border-[#C9A96E]/20 group">
          <div className={`relative w-full ${aspectClass}`}>
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('')
              setUrlInput('')
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            title="Hapus gambar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mode Upload */}
      {mode === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
            transition-all duration-300
            ${
              dragActive
                ? 'border-[#C9A96E] bg-[#C9A96E]/10 scale-[1.01]'
                : 'border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 size={28} className="text-[#C9A96E] animate-spin" />
              <p className="text-sm text-[#6B5B5B]">Mengupload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                <Images size={22} className="text-[#C9A96E]" />
              </div>
              <p className="text-sm font-medium text-[#6B5B5B]">
                Klik atau drag & drop gambar
              </p>
              <p className="text-caption text-[#6B5B5B]/50">
                PNG, JPG, WEBP (maks 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode URL */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A96E]" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#C9A96E]/15 rounded-xl text-sm outline-none focus:border-[#C9A96E] transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-3 bg-[#C9A96E] text-white rounded-xl text-sm font-medium hover:bg-[#B8935A] transition-colors flex-shrink-0"
          >
            Pakai
          </button>
        </div>
      )}
    </div>
  )
}