'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Heart, Sparkles, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminLogin, isAuthenticated } from '@/lib/admin-api'
import {
  isRequired, minLength, maxLength,
  ValidationErrors, hasErrors
} from '@/lib/validation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Jika sudah login, langsung redirect ke /admin
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/admin')
    }
  }, [router])

  const validateLogin = (): boolean => {
    const newErrors: ValidationErrors = {}

    const requiredErr = isRequired(password, 'Password')
    if (requiredErr) {
      newErrors.password = requiredErr
    } else {
      const minErr = minLength(password, 6)
      if (minErr) newErrors.password = minErr

      const maxErr = maxLength(password, 100)
      if (maxErr) newErrors.password = maxErr

      if (password.trim() === '') {
        newErrors.password = 'Password tidak boleh hanya spasi'
      }
    }

    setErrors(newErrors)
    return !hasErrors(newErrors)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return

    setLoading(true)
    try {
      // Pakai adminLogin dari admin-api.ts
      const success = await adminLogin(password.trim())

      if (success) {
        setPassword('')
        setErrors({})
        toast.success('Selamat datang! 🎉')
        router.push('/admin')
      } else {
        setErrors({ password: 'Password salah' })
        setPassword('')
        toast.error('Password salah. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Terjadi kesalahan koneksi')
      setErrors({ password: 'Gagal terhubung ke server' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FBF8F3] via-[#F7E7CE]/30 to-[#DCAE96]/20 flex items-center justify-center px-4">
      <div className="absolute top-20 -left-20 w-96 h-96 bg-[#C9A96E]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#DCAE96]/10 rounded-full blur-3xl"></div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] rounded-3xl rotate-6"></div>
              <div className="relative w-full h-full bg-white rounded-3xl shadow-xl flex items-center justify-center">
                <Heart className="text-[#C9A96E]" size={32} fill="currentColor" />
              </div>
              <Sparkles size={20} className="absolute -top-2 -right-2 text-[#C9A96E]" />
            </motion.div>

            <h1 className="font-display text-3xl text-[#6B5B5B] mb-2">Admin Panel</h1>
            <p className="text-sm text-[#6B5B5B]/60">Wedding Invitation Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({})
              }}
              placeholder="Masukkan password admin"
              icon={<Lock size={18} />}
              error={errors.password}
              required
              autoComplete="current-password"
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#B8935A] transition-colors font-medium"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            </button>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              icon={<Lock size={18} />}
            >
              Masuk ke Dashboard
            </Button>
          </form>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[#6B5B5B]/40 text-xs">
              <div className="w-8 h-px bg-[#C9A96E]/30"></div>
              <Heart size={12} fill="currentColor" />
              <div className="w-8 h-px bg-[#C9A96E]/30"></div>
            </div>
            <p className="mt-3 text-xs text-[#6B5B5B]/50">
              Protected area · Session expires in 24h
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}