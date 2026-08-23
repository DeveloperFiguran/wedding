// src/lib/admin-api.ts

const API_BASE = '/api/admin'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

/**
 * Decode JWT tanpa verify (untuk cek expiry di client)
 */
function decodeToken(token: string): { exp?: number; role?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function isTokenValid(): boolean {
  const token = getToken()
  if (!token) return false
  const decoded = decodeToken(token)
  if (!decoded?.exp) return false
  return decoded.exp > Math.floor(Date.now() / 1000)
}

export function isAuthenticated(): boolean {
  return isTokenValid()
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
  }
}

export async function adminLogin(password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return false
    const { token } = await res.json()
    localStorage.setItem('admin_token', token)
    return true
  } catch {
    return false
  }
}

/**
 * Helper untuk handle response dengan proper error handling
 */
async function handleResponse(res: Response, operation: string): Promise<any> {
  console.log(`[admin-api] ${operation} - Status:`, res.status)

  // Handle 401 (expired/unauthorized)
  if (res.status === 401) {
    console.warn('[admin-api] Unauthorized - logging out')
    adminLogout()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    throw new Error('Session expired. Silakan login ulang.')
  }

  // Handle other errors
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    console.error(`[admin-api] ${operation} Error:`, error)
    throw new Error(error.error || `${operation} failed`)
  }

  return res.json()
}

/**
 * INSERT ke tabel
 * ⚠️ PENTING: data TIDAK BOLEH mengandung `id` atau `created_at`
 */
export async function adminInsert(table: string, data: any): Promise<any> {
  const token = getToken()

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[admin-api] INSERT into ${table}`)
  console.log(`[admin-api] Token:`, token ? `Present (${token.length} chars)` : 'MISSING!')
  console.log(`[admin-api] Data:`, data)

  // Validasi token
  if (!token) {
    adminLogout()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    throw new Error('Not authenticated')
  }

  // ⚠️ VALIDASI: Pastikan tidak ada `id` atau `created_at` di data
  if (data.id) {
    console.error(`[admin-api] ❌ ERROR: data.id masih ada:`, data.id)
    throw new Error('Data tidak boleh mengandung id saat insert')
  }
  if (data.created_at) {
    console.error(`[admin-api] ❌ ERROR: data.created_at masih ada`)
    throw new Error('Data tidak boleh mengandung created_at saat insert')
  }

  const res = await fetch(`${API_BASE}/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ table, data }),
  })

  return handleResponse(res, `INSERT ${table}`)
}

/**
 * UPDATE tabel by ID
 */
export async function adminUpdate(table: string, id: string, data: any): Promise<any> {
  const token = getToken()

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[admin-api] UPDATE ${table} id=${id}`)
  console.log(`[admin-api] Token:`, token ? `Present` : 'MISSING!')
  console.log(`[admin-api] Data:`, data)

  if (!token) {
    adminLogout()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    throw new Error('Not authenticated')
  }

  if (!id || id === 'new') {
    throw new Error('ID invalid untuk update')
  }

  const res = await fetch(`${API_BASE}/generic`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ table, data, id }),
  })

  return handleResponse(res, `UPDATE ${table}`)
}

/**
 * DELETE dari tabel by ID
 */
export async function adminDelete(table: string, id: string): Promise<void> {
  const token = getToken()

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[admin-api] DELETE from ${table} id=${id}`)
  console.log(`[admin-api] Token:`, token ? `Present` : 'MISSING!')

  if (!token) {
    adminLogout()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    throw new Error('Not authenticated')
  }

  if (!id || id === 'new') {
    throw new Error('ID invalid untuk delete')
  }

  const res = await fetch(`${API_BASE}/generic`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ table, id }),
  })

  await handleResponse(res, `DELETE ${table}`)
}

export async function adminUpload(file: File): Promise<any> {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  })

  return handleResponse(res, 'UPLOAD file')
}

export async function adminDeleteFile(filename: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/media`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ filename }),
  })

  await handleResponse(res, 'DELETE file')
}