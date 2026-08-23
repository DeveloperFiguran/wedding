'use client'

import { usePathname } from 'next/navigation'
import { ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'

// const pageTitles: Record<string, { title: string; subtitle: string }> = {
//   '/admin': { title: 'Dashboard', subtitle: 'Ringkasan undangan Anda' },
//   '/admin/settings': { title: 'Pengaturan', subtitle: 'Kelola konten undangan' },
//   '/admin/gallery': { title: 'Gallery', subtitle: 'Kelola foto undangan' },
//   '/admin/documentary': { title: 'Documentary', subtitle: 'Kelola konten dokumenter' },
//   '/admin/love-story': { title: 'Love Story', subtitle: 'Kelola cerita cinta' },
//   '/admin/guests': { title: 'Daftar Tamu', subtitle: 'Kelola tamu & RSVP' },
//   '/admin/generate': { title: 'Generate', subtitle: 'Buat link undangan' },
// }

export function AdminHeader() {
  const pathname = usePathname()
  // const pageInfo = pageTitles[pathname] || { title: 'Admin', subtitle: '' }

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[#C9A96E]/10">
      <div className="mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Page title */}
        <div>
          {/* <h2 className="font-display text-xl md:text-2xl text-[#3D342B]">{pageInfo.title}</h2>
          {pageInfo.subtitle && (
            <p className="text-body-sm text-[#6B5B5B]/60 mt-0.5 hidden sm:block">{pageInfo.subtitle}</p>
          )} */}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-body-sm text-[#6B5B5B]/60">
            <Calendar size={15} className="text-[#C9A96E]" />
            <span>{today}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 border-[#C9A96E]/20 text-[#6B5B5B] hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-all"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">Lihat Situs</span>
          </Link>
        </div>
      </div>
    </header>
  )
}