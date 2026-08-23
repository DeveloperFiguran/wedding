'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { GalleryImage } from '@/types/database'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import Image from 'next/image'
import { SafeImage } from '@/components/ui/SafeImage'

interface GallerySectionProps {
  images: GalleryImage[]
  primaryColor: string
  textColor: string
  backgroundColor: string
}

export function GallerySection({ images, primaryColor, textColor, backgroundColor }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const navigate = (direction: 'next' | 'prev') => {
    if (selectedImage === null) return
    const newIndex = direction === 'next' 
      ? (selectedImage + 1) % images.length 
      : (selectedImage - 1 + images.length) % images.length
    setSelectedImage(newIndex)
  }

  return (
    <section ref={ref} className="py-24 px-4" style={{ backgroundColor }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.4em] mb-4" style={{ color: primaryColor }}>
            Precious Moments
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ color: textColor }}>
            Our Gallery
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }}></div>
            <Camera size={18} style={{ color: primaryColor }} />
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }}></div>
          </div>
        </motion.div>

        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="break-inside-avoid mb-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <button
                onClick={() => setSelectedImage(index)}
                className="relative w-full block group overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <SafeImage
                  src={image.image_url}
                  alt={image.caption || `Gallery ${index + 1}`}
                  width={600}
                  height={index % 3 === 0 ? 800 : 600}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-left transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-elegant text-sm">{image.caption}</p>
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-sm z-50"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>

            <button
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 z-10"
              onClick={(e) => { e.stopPropagation(); navigate('prev') }}
            >
              <ChevronLeft size={28} />
            </button>

            <motion.div
              key={selectedImage}
              className="max-w-full max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <SafeImage
                src={images[selectedImage].image_url}
                alt={images[selectedImage].caption || 'Gallery'}
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {images[selectedImage].caption && (
                <p className="text-center text-white/90 mt-4 font-elegant italic">
                  {images[selectedImage].caption}
                </p>
              )}
            </motion.div>

            <button
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 z-10"
              onClick={(e) => { e.stopPropagation(); navigate('next') }}
            >
              <ChevronRight size={28} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              {selectedImage + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}