'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { DocumentaryImage } from '@/types/database'
import { X, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import Image from 'next/image'
import { SafeImage } from '@/components/ui/SafeImage'

interface DocumentarySectionProps {
  images: DocumentaryImage[]
  primaryColor: string
  textColor: string
  backgroundColor: string
}

export function DocumentarySection({ images, primaryColor, textColor, backgroundColor }: DocumentarySectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  if (images.length === 0) return null

  const navigate = (direction: 'next' | 'prev') => {
    if (selectedImage === null) return
    const newIndex = direction === 'next' 
      ? (selectedImage + 1) % images.length 
      : (selectedImage - 1 + images.length) % images.length
    setSelectedImage(newIndex)
  }

  return (
    <section ref={ref} className="py-24 px-6" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.4em] mb-4" style={{ color: primaryColor }}>
            Our Memories
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ color: textColor }}>
            Documentary
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }}></div>
            <Film size={18} style={{ color: primaryColor }} />
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }}></div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.15 }}
            >
              <button onClick={() => setSelectedImage(index)} className="w-full block text-left">
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="relative w-full aspect-[16/10]">
                    <SafeImage
                      src={image.image_url}
                      alt={image.title || `Documentary ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                      {image.title && (
                        <h3 className="font-display text-xl md:text-3xl mb-2">{image.title}</h3>
                      )}
                      {image.caption && (
                        <p className="font-elegant text-sm md:text-base italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
              className="absolute top-4 right-4 text-white p-3 rounded-full bg-white/10 backdrop-blur-sm z-50"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>

            <button
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 backdrop-blur-sm z-10"
              onClick={(e) => { e.stopPropagation(); navigate('prev') }}
            >
              <ChevronLeft size={28} />
            </button>

            <motion.div
              key={selectedImage}
              className="max-w-full max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <SafeImage
                src={images[selectedImage].image_url}
                alt={images[selectedImage].title || 'Documentary'}
                width={1200}
                height={800}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                {images[selectedImage].title && (
                  <h3 className="font-display text-xl text-white mb-2">{images[selectedImage].title}</h3>
                )}
                {images[selectedImage].caption && (
                  <p className="font-elegant text-sm text-white/80 italic">{images[selectedImage].caption}</p>
                )}
              </div>
            </motion.div>

            <button
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 backdrop-blur-sm z-10"
              onClick={(e) => { e.stopPropagation(); navigate('next') }}
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}