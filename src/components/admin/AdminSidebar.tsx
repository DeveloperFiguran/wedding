'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, Settings, Images, Film, Users, 
  Sparkles, LogOut, Heart, BookOpen, FolderOpen
} from 'lucide-react'
import { adminLogout } from '@/lib/admin-api'

const menuGroups = [
  {
    label: 'Menu Utama',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Konten',
    items: [
      { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
      { href: '/admin/gallery', label: 'Gallery', icon: Images },
      { href: '/admin/documentary', label: 'Documentary', icon: Film },
      { href: '/admin/love-story', label: 'Love Story', icon: BookOpen },
      { href: '/admin/media', label: 'Media', icon: FolderOpen },
    ],
  },
  {
    label: 'Tamu',
    items: [
      { href: '/admin/guests', label: 'Daftar Tamu', icon: Users },
      { href: '/admin/generate', label: 'Generate', icon: Sparkles },
    ],
  },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Hapus token dari localStorage
    adminLogout()
    // Panggil onNavigate untuk tutup mobile menu (jika ada)
    if (onNavigate) onNavigate()
    // Redirect ke login page
    router.replace('/admin/login')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo Header */}
      <div className="px-6 py-6 border-b border-[#C9A96E]/10">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={onNavigate}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center shadow-lg shadow-[#C9A96E]/30 group-hover:scale-105 transition-transform">
            <Heart className="text-white" size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-display text-base text-[#3D342B] leading-tight">Wedding Admin</h1>
            <p className="text-[11px] text-[#6B5B5B]/50 font-sans">Panel Manajemen</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5B5B]/40 font-semibold mb-2 px-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white shadow-md shadow-[#C9A96E]/25'
                          : 'text-[#6B5B5B]/70 hover:bg-[#C9A96E]/8 hover:text-[#3D342B]'
                      }`}
                    >
                      <item.icon
                        size={19}
                        className={`flex-shrink-0 transition-transform ${
                          isActive ? 'text-white' : 'text-[#C9A96E] group-hover:scale-110'
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-white"
                          layoutId="sidebar-dot"
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom - Logout */}
      <div className="px-4 py-4 border-t border-[#C9A96E]/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={19} className="group-hover:-translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  )
}