'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WeddingGiftAccount, WeddingSettings } from '@/types/database'
import { Gift, Copy, Check, QrCode, CreditCard } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { toast } from 'sonner'
import { SafeImage } from '@/components/ui/SafeImage'
import { isValidImageUrl } from '@/lib/validation'
import { getThemeColors } from '@/lib/wedding-helpers'
import { getAdaptiveStyles, withAlpha } from '@/lib/theme-utils'
import {
  ThemeCard,
  AccentIconBox,
  ThemeButton,
  ThemeText,
  OrnamentDivider,
} from '@/components/ui/ThemeCard'

export function WeddingGift({ settings }: { settings: WeddingSettings }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedQrisId, setExpandedQrisId] = useState<string | null>(null)

  const colors = getThemeColors(settings)
  const styles = getAdaptiveStyles(settings)

  const bankAccounts = (settings.gift_accounts || [])
    .filter((a) => a.provider_type === 'bank' && a.account_number)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  const qrisAccounts = (settings.gift_accounts || [])
    .filter(
      (a) =>
        a.provider_type === 'qris' &&
        a.qris_url &&
        isValidImageUrl(a.qris_url)
    )
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  if (bankAccounts.length === 0 && qrisAccounts.length === 0) return null

  const handleCopy = async (account: WeddingGiftAccount) => {
    if (!account.account_number) return
    try {
      await copyToClipboard(account.account_number)
      setCopiedId(account.id)
      toast.success(`Rekening ${account.bank_name} disalin!`)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Gagal menyalin nomor rekening')
    }
  }

  const toggleQris = (id: string) => {
    setExpandedQrisId(expandedQrisId === id ? null : id)
  }

  return (
    <section
      id="gift"
      className="py-24 px-6"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ThemeText
            settings={settings}
            level="secondary"
            className="text-xs uppercase tracking-[0.4em] mb-4 font-medium"
            style={{ color: colors.primary }}
          >
            Wedding Gift
          </ThemeText>
          <ThemeText
            settings={settings}
            as="h2"
            className="font-display text-4xl md:text-5xl mb-4"
          >
            Kirim Hadiah
          </ThemeText>
          <OrnamentDivider settings={settings} className="mb-4" />
          <ThemeText
            settings={settings}
            level="muted"
            className="text-sm font-elegant italic max-w-md mx-auto leading-relaxed"
          >
            Doa restu Anda merupakan karunia terindah. Namun jika ingin
            memberikan tanda kasih, kami menyediakan amplop digital.
          </ThemeText>
        </motion.div>

        <div className="space-y-4">
          {/* Label Transfer Bank (hanya jika >1 bank) */}
          {/* {bankAccounts.length > 1 && (
            <ThemeText
              settings={settings}
              className="text-[10px] uppercase tracking-[0.3em] font-semibold px-1"
              style={{ color: colors.primary }}
            >
              Transfer Bank
            </ThemeText>
          )} */}

          {/* ============ BANK ACCOUNTS ============ */}
          {bankAccounts.map((account, index) => (
            <ThemeCard
              key={account.id}
              settings={settings}
              variant="solid"
              delay={index * 0.08}
              hover
            >
              <div className="flex items-center gap-3 mb-4">
                <AccentIconBox settings={settings}>
                  <CreditCard size={22} />
                </AccentIconBox>
                <div className="flex-1 min-w-0">
                  <ThemeText
                    settings={settings}
                    className="font-semibold text-base truncate"
                  >
                    {account.bank_name || 'Bank'}
                  </ThemeText>
                  <ThemeText
                    settings={settings}
                    level="muted"
                    className="text-xs truncate"
                  >
                    a.n. {account.account_holder_name || '-'}
                  </ThemeText>
                </div>
              </div>

              {/* Number Box */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl gap-3"
                style={styles.box.soft}
              >
                <span
                  className="text-base md:text-lg font-display font-bold tracking-wider flex-1 break-all"
                  style={{ color: styles.text.primary }}
                >
                  {account.account_number}
                </span>
                <ThemeButton
                  settings={settings}
                  onClick={() => handleCopy(account)}
                  className="!p-2.5 !rounded-xl flex-shrink-0"
                >
                  {copiedId === account.id ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </ThemeButton>
              </div>

              {/* Copied Feedback */}
              {copiedId === account.id && (
                <motion.p
                  className="text-xs text-center mt-3 font-medium flex items-center justify-center gap-1"
                  style={{ color: colors.primary }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Check size={12} />
                  Nomor rekening tersalin
                </motion.p>
              )}
            </ThemeCard>
          ))}

          {/* ============ QRIS ACCOUNTS (tanpa section label) ============ */}
          {qrisAccounts.map((account, index) => {
            const isExpanded = expandedQrisId === account.id

            return (
              <ThemeCard
                key={account.id}
                settings={settings}
                variant="solid"
                delay={(bankAccounts.length + index) * 0.08}
                padding="none"
              >
                {/* QRIS Toggle Button - tanpa nama, langsung ke card */}
                <button
                  onClick={() => toggleQris(account.id)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-left transition-all duration-300"
                  style={{
                    backgroundColor: isExpanded
                      ? withAlpha(colors.primary, styles.isDark ? 0.08 : 0.04)
                      : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AccentIconBox settings={settings} size="sm">
                      <QrCode size={16} />
                    </AccentIconBox>
                    <div className="flex-1 min-w-0">
                      <ThemeText
                        settings={settings}
                        className="font-semibold text-sm truncate"
                      >
                        QRIS
                      </ThemeText>
                      <ThemeText
                        settings={settings}
                        level="muted"
                        className="text-xs truncate"
                      >
                        {isExpanded ? 'Tap untuk tutup' : 'Tap untuk lihat kode QR'}
                      </ThemeText>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: colors.primary }}
                    className="flex-shrink-0"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                </button>

                {/* QRIS Image Expanded */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-center">
                    {/* QRIS Container dengan shadow theme */}
                    <div
                      className="inline-block p-4 rounded-2xl"
                      style={{
                        backgroundColor: '#FFFFFF',
                        boxShadow: `0 8px 32px ${withAlpha(colors.primary, 0.25)}, 0 0 0 1px ${withAlpha(colors.primary, 0.1)}`,
                      }}
                    >
                      <SafeImage
                        src={account.qris_url!}
                        alt="QRIS Code"
                        width={240}
                        height={240}
                        className="rounded-lg"
                      />
                    </div>
                    {/* Hint text */}
                    <ThemeText
                      settings={settings}
                      level="subtle"
                      className="text-[10px] mt-3"
                    >
                      Scan dengan aplikasi mobile banking atau e-wallet
                    </ThemeText>
                  </div>
                </motion.div>
              </ThemeCard>
            )
          })}
        </div>

        {/* Footer */}
        <ThemeText
          settings={settings}
          level="subtle"
          className="text-center text-xs mt-8 italic"
        >
          Terima kasih atas perhatian dan doanya 🙏
        </ThemeText>
      </div>
    </section>
  )
}