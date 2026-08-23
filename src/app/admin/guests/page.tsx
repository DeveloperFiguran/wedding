'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Guest } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Search, Copy, Check, Users, UserCheck, UserX, Mail, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/utils'
import { adminDelete, isAuthenticated } from '@/lib/admin-api'

type FilterType = 'all' | 'hadir' | 'tidak_hadir' | 'belum_rsvp'

export default function AdminGuests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; guest: Guest | null }>({
    open: false,
    guest: null,
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // ✅ Cek authentication sebelum fetch
    if (!isAuthenticated()) {
      window.location.href = '/admin/login'
      return
    }
    fetchGuests()
  }, [])

  async function fetchGuests() {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    setGuests(data || [])
    setLoading(false)
  }

  // ✅ FIX: Gunakan adminDelete (service_role via API endpoint)
  const handleDelete = async () => {
    if (!deleteDialog.guest) return
    
    // Cek authentication
    if (!isAuthenticated()) {
      toast.error('Session expired. Silakan login ulang.')
      window.location.href = '/admin/login'
      return
    }

    setDeleting(true)
    try {
      // ✅ Gunakan adminDelete yang pakai service_role via API
      await adminDelete('guests', deleteDialog.guest.id)
      
      setGuests((prev) => prev.filter((g) => g.id !== deleteDialog.guest!.id))
      toast.success('Tamu berhasil dihapus')
      setDeleteDialog({ open: false, guest: null })
    } catch (err: any) {
      console.error('Delete guest error:', err)
      
      if (err.message.includes('Unauthorized') || err.message.includes('Session expired')) {
        toast.error('Session expired. Silakan login ulang.')
        window.location.href = '/admin/login'
      } else {
        toast.error(`Gagal menghapus: ${err.message}`)
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleCopyLink = async (code: string, id: string) => {
    const link = `${window.location.origin}/u/${code}`
    await copyToClipboard(link)
    setCopiedId(id)
    toast.success('Link berhasil disalin!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    switch (filter) {
      case 'hadir': return g.rsvp_status === 'hadir'
      case 'tidak_hadir': return g.rsvp_status === 'tidak_hadir'
      case 'belum_rsvp': return g.rsvp_status === null
      default: return true
    }
  })

  const stats = {
    all: guests.length,
    hadir: guests.filter(g => g.rsvp_status === 'hadir').length,
    tidak_hadir: guests.filter(g => g.rsvp_status === 'tidak_hadir').length,
    belum_rsvp: guests.filter(g => g.rsvp_status === null).length,
  }

  const filterButtons: Array<{ type: FilterType; label: string; count: number; icon: any; color: string }> = [
    { type: 'all', label: 'Semua', count: stats.all, icon: Users, color: 'from-[#C9A96E] to-[#DCAE96]' },
    { type: 'hadir', label: 'Hadir', count: stats.hadir, icon: UserCheck, color: 'from-green-500 to-emerald-600' },
    { type: 'tidak_hadir', label: 'Tidak Hadir', count: stats.tidak_hadir, icon: UserX, color: 'from-red-500 to-red-600' },
    { type: 'belum_rsvp', label: 'Belum RSVP', count: stats.belum_rsvp, icon: Mail, color: 'from-gray-400 to-gray-500' },
  ]

  if (loading) return <LoadingSpinner text="Memuat data tamu..." />

  return (
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display text-[#6B5B5B]">Daftar Tamu</h1>
        <p className="text-sm text-[#6B5B5B]/60 mt-1">Kelola tamu undangan dan status RSVP</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => {
          const Icon = btn.icon
          const isActive = filter === btn.type
          return (
            <button
              key={btn.type}
              onClick={() => setFilter(btn.type)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold
                transition-all duration-300
                ${isActive
                  ? `bg-gradient-to-r ${btn.color} text-white shadow-lg`
                  : 'bg-white text-[#6B5B5B]/70 border-2 border-[#C9A96E]/10 hover:border-[#C9A96E]/30'
                }
              `}
            >
              <Icon size={16} />
              {btn.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[#C9A96E]/10 text-[#C9A96E]'}`}>
                {btn.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <Input
        placeholder="Cari nama tamu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search size={18} />}
      />

      {/* Guest List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-md border border-[#C9A96E]/10 hover:shadow-lg hover:border-[#C9A96E]/20 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center text-white font-display text-xl shadow-lg flex-shrink-0">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#6B5B5B] truncate">{guest.name}</h3>
                    <code className="text-xs bg-[#C9A96E]/10 text-[#C9A96E] px-2 py-0.5 rounded-lg font-mono">
                      {guest.code}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {guest.rsvp_status ? (
                    <span className={`
                      text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1
                      ${guest.rsvp_status === 'hadir'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                      }
                    `}>
                      {guest.rsvp_status === 'hadir' ? (
                        <><UserCheck size={12} /> Hadir ({guest.rsvp_count})</>
                      ) : (
                        <><UserX size={12} /> Tidak Hadir</>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 font-semibold">
                      Belum RSVP
                    </span>
                  )}

                  <button
                    onClick={() => handleCopyLink(guest.code, guest.id)}
                    className="p-2.5 hover:bg-[#C9A96E]/10 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-[#C9A96E]"
                    title="Salin link undangan"
                  >
                    {copiedId === guest.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                  <a
                    href={`/u/${guest.code}`}
                    target="_blank"
                    className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-blue-500"
                    title="Buka undangan"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => setDeleteDialog({ open: true, guest })}
                    className="p-2.5 hover:bg-red-50 rounded-xl transition-colors text-[#6B5B5B]/60 hover:text-red-500"
                    title="Hapus tamu"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {guest.wish && (
                <div className="mt-3 p-3 bg-gradient-to-r from-[#FBF8F3] to-[#F7E7CE]/20 rounded-xl border border-[#C9A96E]/10">
                  <p className="text-sm text-[#6B5B5B]/80 italic">💬 "{guest.wish}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredGuests.length === 0 && (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#C9A96E]/10">
            <Users size={48} className="mx-auto text-[#C9A96E]/30 mb-4" />
            <p className="text-[#6B5B5B]/50">
              {search ? 'Tidak ada tamu yang cocok' : 'Belum ada tamu terdaftar'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, guest: null })}
        onConfirm={handleDelete}
        title="Hapus Tamu?"
        description={`Apakah Anda yakin ingin menghapus "${deleteDialog.guest?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon={<Trash2 size={24} />}
        loading={deleting}
      />
    </div>
  )
}