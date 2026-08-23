import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

export interface AdminSession {
  role: 'admin'
  iat: number
  exp: number
}

export function loginAdmin(password: string): string | null {
  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD not configured')
  }

  if (password !== ADMIN_PASSWORD) {
    return null
  }

  const token = jwt.sign(
    { role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  return token
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminSession
    return decoded
  } catch {
    return null
  }
}