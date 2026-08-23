import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { verifyAdminToken } from '@/lib/admin-auth'

const BUCKET = 'wedding-files'
const MAX_SIZE_MB = 10

const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const ALLOWED_AUDIO_EXTS = ['mp3']
const ALLOWED_EXTS = [...ALLOWED_IMAGE_EXTS, ...ALLOWED_AUDIO_EXTS]

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

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp3: 'audio/mpeg',
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return false

  const result = verifyAdminToken(token)
  return result !== null
}

async function validateFile(file: File): Promise<string | null> {
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Ukuran maksimal ${MAX_SIZE_MB}MB`
  }

  if (file.size === 0) {
    return 'File kosong'
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXTS.includes(ext)) {
    return `Ekstensi tidak diizinkan. Gunakan: ${ALLOWED_EXTS.join(', ')}`
  }

  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return 'Nama file tidak valid'
  }

  try {
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    const signatures = MAGIC_BYTES[ext] || []
    const isValid = signatures.some(sig =>
      sig.every((byte, i) => bytes[i] === byte)
    )

    if (!isValid) {
      return 'Konten file tidak sesuai dengan ekstensinya'
    }
  } catch {
    return 'Gagal membaca file'
  }

  return null
}

function getFileType(ext: string): 'image' | 'audio' {
  return ALLOWED_AUDIO_EXTS.includes(ext) ? 'audio' : 'image'
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File tidak ada' }, { status: 400 })
    }

    const validationError = await validateFile(file)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabaseAdmin = createServerSupabase()

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileType = getFileType(ext)

    // Upload langsung ke root bucket (tanpa subfolder)
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(safeFileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: MIME_TYPES[ext] || 'application/octet-stream',
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(safeFileName)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      filename: safeFileName,
      fileType,
    })
  } catch (err: any) {
    console.error('Server error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename } = await request.json()
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    if (filename.includes('..') || filename.startsWith('/') || filename.startsWith('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const supabaseAdmin = createServerSupabase()

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([filename])
    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Server error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}