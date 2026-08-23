'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9)

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#6B5B5B]/80 mb-2 uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 ${error ? 'text-red-400' : 'text-[#C9A96E]'}`}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-4
              bg-white/90 backdrop-blur-sm
              border-2 rounded-2xl
              text-sm text-[#6B5B5B] font-sans
              placeholder:text-[#6B5B5B]/30
              transition-all duration-300 outline-none
              ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-[#C9A96E]/15 hover:border-[#C9A96E]/30 focus:border-[#C9A96E] focus:ring-4 focus:ring-[#C9A96E]/10'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={13} />
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-[#6B5B5B]/50">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'