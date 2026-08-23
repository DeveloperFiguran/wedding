'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white hover:shadow-xl hover:shadow-[#C9A96E]/30',
  secondary: 'bg-white text-[#6B5B5B] border-2 border-[#C9A96E]/20 hover:border-[#C9A96E] hover:bg-[#C9A96E]/5',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:shadow-red-500/30',
  ghost: 'bg-transparent text-[#6B5B5B] hover:bg-[#C9A96E]/10',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-green-500/30',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2
        rounded-2xl font-semibold tracking-wide
        shadow-lg transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...(props as any)}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </motion.button>
  )
}