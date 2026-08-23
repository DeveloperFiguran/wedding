// src/lib/utils.ts

// =====================================================
// ORIGINAL FUNCTIONS (untuk admin & internal)
// =====================================================

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  return `${hours}:${minutes} WIB`
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // Fallback untuk browser lama atau SSR
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
      } catch (e) {
        console.error('Copy failed:', e)
      }
      document.body.removeChild(textarea)
    }
  }
}

export function hasValue(str?: string | null): boolean {
  return Boolean(str && str.trim().length > 0)
}

/**
 * Parse datetime-local input (local time) ke ISO string (UTC)
 */
export function localToISO(localStr: string): string {
  if (!localStr) return ''
  const date = new Date(localStr)
  return date.toISOString()
}

/**
 * ISO string (UTC) ke datetime-local format (local time)
 */
export function isoToLocal(isoStr: string): string {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function parseDateForCountdown(dateStr: string): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

export function formatDateWithTimezone(
  isoString: string,
  timezone: string = 'Asia/Jakarta',
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    }

    return date.toLocaleDateString('id-ID', defaultOptions)
  } catch (err) {
    console.error('Format date error:', err)
    return ''
  }
}

export function formatTimeWithTimezone(
  isoString: string,
  timezone: string = 'Asia/Jakarta'
): string {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('id-ID', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (err) {
    console.error('Format time error:', err)
    return ''
  }
}

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Jakarta', label: 'WIB - Jakarta (UTC+7)' },
  { value: 'Asia/Makassar', label: 'WITA - Makassar (UTC+8)' },
  { value: 'Asia/Jayapura', label: 'WIT - Jayapura (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (UTC+8)' },
]

// =====================================================
// HYDRATION-SAFE FUNCTIONS (untuk invitation / public)
// =====================================================

/**
 * Format date dengan timezone eksplisit - konsisten di server & client.
 * Pakai ini di semua component invitation yang menampilkan tanggal.
 */
export function formatDateSafe(
  dateStr: string | null | undefined,
  timezone: string = 'Asia/Jakarta',
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('id-ID', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(date)
  } catch {
    return ''
  }
}

/**
 * Format date pendek (tanpa nama hari) - cocok untuk cover/hero.
 */
export function formatDateShort(
  dateStr: string | null | undefined,
  timezone: string = 'Asia/Jakarta'
): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('id-ID', {
      timeZone: timezone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

/**
 * Format time aman - tidak bergantung pada timezone lokal browser.
 */
export function formatTimeSafe(timeStr: string | null | undefined): string {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  return `${parts[0]}:${parts[1]} WIB`
}

/**
 * isoToLocal yang aman untuk admin form.
 * Return empty string sebelum hydration untuk menghindari mismatch.
 */
export function isoToLocalSafe(
  isoStr: string | null | undefined,
  hydrated: boolean
): string {
  if (!isoStr) return ''
  if (!hydrated) return ''
  return isoToLocal(isoStr)
}

/**
 * Hitung Date target untuk countdown dengan timezone eksplisit.
 * Hasil konsisten di server dan client.
 */
export function getCountdownDate(
  isoStr: string | null | undefined,
  timezone: string = 'Asia/Jakarta'
): Date | null {
  if (!isoStr) return null
  try {
    const date = new Date(isoStr)
    if (isNaN(date.getTime())) return null

    // Ambil string dalam timezone target
    const inTz = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)

    // Format: "MM/DD/YYYY, HH:MM:SS"
    const [datePart, timePart] = inTz.split(', ')
    const [month, day, year] = datePart.split('/')
    const [hour, minute] = timePart.split(':')

    // Buat Date object dari angka (konsisten di semua environment)
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      0
    )
  } catch {
    return null
  }
}

/**
 * Konversi tanggal dari date picker ke ISO string.
 * Menggunakan waktu 12:00 UTC untuk menghindari masalah timezone.
 * 
 * Input: "2026-10-10" (dari <input type="date">)
 * Output: "2026-10-10T12:00:00.000Z" (noon UTC, aman di semua timezone)
 */
export function dateToISO(dateString: string): string {
  if (!dateString) return ''
  // Langsung set sebagai noon UTC - tidak terpengaruh timezone lokal
  return `${dateString}T12:00:00.000Z`
}

/**
 * Konversi ISO string kembali ke tanggal untuk date picker.
 * Hanya mengambil bagian tanggal tanpa konversi timezone.
 * 
 * Input: "2026-10-09T17:00:00.000Z" atau "2026-10-10T12:00:00.000Z"
 * Output: "2026-10-10" atau "2026-10-09" (string tanggal saja)
 */
export function isoToDate(isoString: string | null | undefined): string {
  if (!isoString) return ''
  // Jika sudah format YYYY-MM-DD murni
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return isoString
  // Ambil bagian tanggal dari ISO string (sebelum T)
  return isoString.split('T')[0]
}

/**
 * Format tanggal untuk ditampilkan di undangan (dengan timezone).
 * Gunakan ini untuk DISPLAY, bukan untuk input date picker.
 */
export function formatEventDate(isoString: string | null | undefined, timezone: string = 'Asia/Jakarta'): string {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('id-ID', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoToDate(isoString)
  }
}
