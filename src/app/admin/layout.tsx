'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { isTokenValid, adminLogout } from '@/lib/admin-api'
import { Heart, Menu, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isPublicRoute = pathname === '/admin/login'

  useEffect(() => {
    // Cek token validity (decode JWT di client, cek expiry)
    const valid = isTokenValid()

    if (isPublicRoute) {
      // Jika sudah login dan akses /login, redirect ke dashboard
      if (valid) {
        router.push('/admin')
        return
      }
      setLoading(false)
      return
    }

    // Protected routes: harus punya token valid
    if (!valid) {
      adminLogout() // cleanup
      toast.error('Session expired. Silakan login ulang.')
      router.push('/admin/login')
      return
    }

    setIsAuthed(true)
    setLoading(false)
  }, [pathname, isPublicRoute, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF8F3] to-[#F7E7CE]/30">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-2 border-[#C9A96E]/30 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
            <Heart className="absolute inset-0 m-auto text-[#C9A96E] animate-pulse" size={20} />
          </div>
          <p className="font-elegant text-[#6B5B5B] italic">Memverifikasi sesi...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed && !isPublicRoute) return null
  if (isPublicRoute) return <>{children}</>

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F7E7CE]/20">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-[#C9A96E]/20 text-[#6B5B5B]"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 border-r border-[#C9A96E]/10 shadow-xl z-40">
        <AdminSidebar />
      </aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <AdminSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8 pt-20 lg:pt-8">
          {children}
        </main>
        <footer className="px-4 md:px-6 lg:px-8 py-5 border-t border-[#C9A96E]/10">
          <div className="flex items-center justify-between text-caption text-[#6B5B5B]/50">
            <span>© {new Date().getFullYear()} Wedding Invitation</span>
            <span className="font-elegant italic">Made with ♥</span>
          </div>
        </footer>
      </div>
    </div>
  )
}