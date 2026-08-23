'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { generateUniqueCode } from '@/lib/generate-code'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles, Copy, Check, Link, User, ExternalLink, History } from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/utils'

export default function GenerateInvitation() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<Array<{ name: string; code: string; link: string }>>([])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Masukkan nama tamu')
      return
    }

    setLoading(true)
    try {
      const code = generateUniqueCode()
      const { error } = await supabase.from('guests').insert({ name: name.trim(), code })
      if (error) throw error

      const link = `${window.location.origin}/u/${code}`
      setGeneratedLink(link)
      setGeneratedCode(code)
      setHistory(prev => [{ name: name.trim(), code, link }, ...prev.slice(0, 4)])
      setName('')
      toast.success('Undangan berhasil di-generate! 🎉')
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    await copyToClipboard(text)
    setCopied(true)
    toast.success('Link berhasil disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display text-[#6B5B5B]">Generate Undangan</h1>
        <p className="text-sm text-[#6B5B5B]/60 mt-1">Buat link undangan unik untuk setiap tamu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card
          title="Buat Undangan Baru"
          subtitle="Masukkan nama tamu untuk generate link"
          icon={<Sparkles size={20} />}
        >
          <form onSubmit={handleGenerate} className="space-y-5">
            <Input
              label="Nama Tamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap tamu"
              icon={<User size={16} />}
              required
            />

            <Button
              type="submit"
              loading={loading}
              icon={<Sparkles size={18} />}
              fullWidth
              size="lg"
            >
              Generate Undangan
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <p className="text-xs text-blue-700">
              💡 <strong>Tips:</strong> Setiap tamu mendapat kode unik 6 karakter. 
              Link bisa langsung dikirim via WhatsApp atau email.
            </p>
          </div>
        </Card>

        {/* Result */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {generatedLink && (
              <motion.div
                key={generatedCode}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <Check size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-green-800">Berhasil Dibuat!</h3>
                      <p className="text-xs text-green-600">
                        Kode: <code className="bg-green-100 px-2 py-0.5 rounded font-mono font-bold">{generatedCode}</code>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border-2 border-green-200 mb-4">
                    <div className="flex items-center gap-2">
                      <Link size={16} className="text-green-600 flex-shrink-0" />
                      <span className="text-sm font-mono text-[#6B5B5B] truncate flex-1">
                        {generatedLink}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(generatedLink)}
                      variant="success"
                      icon={copied ? <Check size={16} /> : <Copy size={16} />}
                      className="flex-1"
                    >
                      {copied ? 'Tersalin!' : 'Copy Link'}
                    </Button>
                    <a
                      href={generatedLink}
                      target="_blank"
                      className="p-3 bg-white border-2 border-green-200 rounded-2xl text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {history.length > 0 && (
            <Card
              title="Riwayat Generate"
              subtitle={`${history.length} undangan terakhir`}
              icon={<History size={20} />}
            >
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FBF8F3] border border-[#C9A96E]/10 hover:border-[#C9A96E]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A96E] to-[#DCAE96] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#6B5B5B] truncate">{item.name}</p>
                        <p className="text-xs text-[#6B5B5B]/50 font-mono">{item.code}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(item.link)}
                      className="p-2 hover:bg-[#C9A96E]/10 rounded-xl transition-colors text-[#C9A96E] flex-shrink-0"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}