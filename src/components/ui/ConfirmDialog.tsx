'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'
import { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: ReactNode
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  icon,
  loading = false,
}: ConfirmDialogProps) {
  const config = {
    danger: { iconBg: 'bg-red-100', iconColor: 'text-red-600', btnVariant: 'danger' as const },
    warning: { iconBg: 'bg-amber-100', iconColor: 'text-amber-600', btnVariant: 'primary' as const },
    info: { iconBg: 'bg-blue-100', iconColor: 'text-blue-600', btnVariant: 'primary' as const },
  }[variant]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {icon || <AlertTriangle className={config.iconColor} size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl text-[#6B5B5B] mb-2">{title}</h3>
                  <p className="text-sm text-[#6B5B5B]/70 leading-relaxed">{description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#6B5B5B]/40 hover:text-[#6B5B5B] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
                  {cancelText}
                </Button>
                <Button variant={config.btnVariant} onClick={onConfirm} loading={loading} className="flex-1">
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}