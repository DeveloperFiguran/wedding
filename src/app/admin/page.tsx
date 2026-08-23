'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Guest } from '@/types/database'
import { Users, UserCheck, UserX, Mail, TrendingUp, Heart, MessageCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const stats = {
    total: guests.length,
    rsvp: guests.filter((g) => g.rsvp_status !== null).length,
    hadir: guests.filter((g) => g.rsvp_status === 'hadir').length,
    tidakHadir: guests.filter((g) => g.rsvp_status === 'tidak_hadir').length,
    totalGuests: guests.reduce((sum, g) => sum + (g.rsvp_count || 0), 0),
  }

  const statCards = [
    { title: 'Total Undangan', value: stats.total, icon: Users, gradient: 'from-blue-500 to-blue-600', description: 'Total tamu diundang' },
    { title: 'Sudah RSVP', value: stats.rsvp, icon: Mail, gradient: 'from-purple-500 to-purple-600', description: `${Math.round((stats.rsvp / (stats.total || 1)) * 100)}% response rate` },
    { title: 'Hadir', value: stats.hadir, icon: UserCheck, gradient: 'from-green-500 to-green-600', description: `${stats.totalGuests} total orang` },
    { title: 'Tidak Hadir', value: stats.tidakHadir, icon: UserX, gradient: 'from-red-500 to-red-600', description: 'Dengan permohonan maaf' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#C9A96E]/20 border-t-[#C9A96E] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center shadow-lg">
            <Heart className="text-white" size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-[#6B5B5B]">Dashboard</h1>
            <p className="text-sm text-[#6B5B5B]/60">Selamat datang kembali! 👋</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#6B5B5B] mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-[#6B5B5B]/70">{stat.title}</p>
            <p className="text-xs text-[#6B5B5B]/50 mt-1">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display text-[#6B5B5B]">Ucapan Terbaru</h2>
              <p className="text-xs text-[#6B5B5B]/50">Doa dan harapan dari para tamu</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {guests.filter((g) => g.wish).slice(0, 5).map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#FBF8F3] to-[#F7E7CE]/20 border border-[#C9A96E]/10"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center text-white font-semibold flex-shrink-0">
                {guest.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-[#6B5B5B] truncate">{guest.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    guest.rsvp_status === 'hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {guest.rsvp_status === 'hadir' ? '✓ Hadir' : '✗ Tidak'}
                  </span>
                </div>
                <p className="text-sm text-[#6B5B5B]/70 italic line-clamp-2">"{guest.wish}"</p>
              </div>
            </motion.div>
          ))}

          {guests.filter((g) => g.wish).length === 0 && (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-[#C9A96E]/30 mb-3" />
              <p className="text-[#6B5B5B]/50">Belum ada ucapan dari tamu</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}