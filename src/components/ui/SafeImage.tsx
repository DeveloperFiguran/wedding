'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { Images as ImageIcon } from 'lucide-react'
import { isValidImageUrl } from '@/lib/validation'

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null
  fallback?: React.ReactNode
}

export function SafeImage({ src, fallback, alt, className, onError, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const hasValidSrc = isValidImageUrl(src) && !hasError

  if (!hasValidSrc) {
    if (fallback) return <>{fallback}</>
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || ''}`} {...(props as any)}>
        <ImageIcon size={32} className="text-gray-300" />
      </div>
    )
  }

  return (
    <Image
      src={src!}
      alt={alt}
      className={className}
      onError={(e) => {
        setHasError(true)
        onError?.(e)
      }}
      {...props}
    />
  )
}