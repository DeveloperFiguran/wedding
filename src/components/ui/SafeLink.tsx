'use client'

import { AnchorHTMLAttributes, ReactNode } from 'react'
import { sanitizeUrl, isSafeUrl } from '@/lib/validation'
import { ExternalLink } from 'lucide-react'

// Gunakan Omit untuk exclude 'href', lalu definisikan ulang dengan type yang lebih fleksibel
interface SafeLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string | undefined | null
  children: ReactNode
  external?: boolean
  showIcon?: boolean
}

export function SafeLink({
  href,
  children,
  external = true,
  showIcon = false,
  className = '',
  style,
  ...props
}: SafeLinkProps) {
  // Sanitasi URL
  const safeHref = sanitizeUrl(href)

  // Jika URL tidak valid/safe, render sebagai text biasa
  if (!safeHref || !isSafeUrl(safeHref)) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    )
  }

  return (
    <a
      href={safeHref}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer nofollow' : undefined}
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={style}
      {...props}
    >
      {children}
      {showIcon && external && <ExternalLink size={12} />}
    </a>
  )
}