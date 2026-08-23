// ====== REQUIRED ======
export function isRequired(value: string | undefined | null, fieldName = 'Field'): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} wajib diisi`
  }
  return null
}

// ====== URL ======
export function isValidUrl(value: string): boolean {
  if (!value || value.trim() === '') return true // kosong OK (opsional)
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// ====== WARNA HEX ======
export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

export function validateHexColor(value: string, fieldName = 'Warna'): string | null {
  if (!value || value.trim() === '') return null
  if (!isValidHexColor(value)) {
    return `${fieldName} harus format hex (contoh: #C9A96E)`
  }
  return null
}

// ====== ANGKA ======
export function isNumeric(value: string): boolean {
  if (!value || value.trim() === '') return true
  return /^[0-9]+$/.test(value)
}

export function validateNumeric(value: string, fieldName = 'Angka'): string | null {
  if (!value || value.trim() === '') return null
  if (!isNumeric(value)) {
    return `${fieldName} harus berupa angka`
  }
  return null
}

// ====== PANJANG TEKS ======
export function minLength(value: string, min: number): string | null {
  if (value && value.trim().length < min) {
    return `Minimal ${min} karakter`
  }
  return null
}

export function maxLength(value: string, max: number): string | null {
  if (value && value.trim().length > max) {
    return `Maksimal ${max} karakter`
  }
  return null
}

// ====== INSTAGRAM ======
export function validateInstagram(value: string): string | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/^@/, '')
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned) || cleaned.startsWith('.')) {
    return 'Username Instagram tidak valid (tanpa @, hanya huruf/angka/._)'
  }
  return null
}

// ====== HASHTAG ======
export function validateHashtag(value: string): string | null {
  if (!value || value.trim() === '') return null
  if (!/^#[a-zA-Z0-9_]+$/.test(value)) {
    return 'Hashtag harus diawali # dan hanya berisi huruf/angka/underscore'
  }
  return null
}

// ====== FILE GAMBAR ======
export function validateImageFile(file: File, maxSizeMB = 5): string | null {
  if (!file.type.startsWith('image/')) {
    return 'File harus berupa gambar (PNG, JPG, WEBP)'
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Ukuran gambar maksimal ${maxSizeMB}MB`
  }
  return null
}

// ====== TANGGAL ======
export function validateDate(value: string, fieldName = 'Tanggal'): string | null {
  if (!value || value.trim() === '') return null
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return `${fieldName} tidak valid`
  }
  return null
}

// ====== Helper: kumpulkan errors ======
export type ValidationErrors = Record<string, string>

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

// ====== URL GAMBAR (untuk next/image) ======
export function isValidImageUrl(value: string | undefined | null): boolean {
  if (!value || value.trim() === '') return false
  const trimmed = value.trim()
  // Harus http/https dan minimal punya hostname
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (!url.hostname || url.hostname.length < 2) return false
    return true
  } catch {
    return false
  }
}

// Update fungsi yang sudah ada untuk memakai ini
export function validateUrl(value: string, fieldName = 'URL'): string | null {
  if (!value || value.trim() === '') return null
  if (!isValidImageUrl(value)) {
    return `${fieldName} tidak valid (harus diawali http:// atau https://)`
  }
  return null
}

// ====== SANITIZATION untuk keamanan ======

// Whitelist protocol untuk URL
const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:']

export function sanitizeUrl(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    if (!SAFE_URL_PROTOCOLS.includes(url.protocol)) {
      return '' // Block javascript:, data:, vbscript:, dll
    }
    return url.toString()
  } catch {
    return ''
  }
}

// Sanitasi text umum (escape karakter berbahaya)
// export function sanitizeText(value: string | undefined | null): string {
// if (!value || typeof value !== 'string') return ''
//  return value
//    .replace(/&/g, '&amp;')
//    .replace(/</g, '&lt;')
//    .replace(/>/g, '&gt;')
//    .replace(/"/g, '&quot;')
//    .replace(/'/g, '&#x27;')
// }

// PENTING: Jangan escape HTML di sini!
// React sudah auto-escape saat render.
export function sanitizeText(value: string | undefined | null): string {  
  if (!value || typeof value !== 'string') return ''  
    return value
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim()
}

// Sanitasi untuk attribute HTML (lebih strict)
export function sanitizeAttribute(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return ''
  // Hapus karakter kontrol & karakter yang bisa inject attribute
  return value.replace(/[\x00-\x1F\x7F"'`<>]/g, '')
}

// Cek apakah URL aman (untuk link href & iframe src)
export function isSafeUrl(value: string | undefined | null): boolean {
  const sanitized = sanitizeUrl(value)
  return sanitized.length > 0
}

// Sanitasi Instagram username (strip @ dan karakter berbahaya)
export function sanitizeInstagramUsername(value: string): string {
  if (!value) return ''
  return value
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 30)
}

// Sanitasi hashtag
export function sanitizeHashtag(value: string): string {
  if (!value) return ''
  const cleaned = value.startsWith('#') ? value.slice(1) : value
  const sanitized = cleaned.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50)
  return sanitized ? `#${sanitized}` : ''
}

