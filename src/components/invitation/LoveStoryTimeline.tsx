'use client'

import { motion, useInView } from 'framer-motion'
import { LoveStory } from '@/types/database'
import { Heart, Calendar } from 'lucide-react'
import { useRef } from 'react'
import Image from 'next/image'
import { SafeImage } from '@/components/ui/SafeImage'

interface LoveStoryTimelineProps {
  stories: LoveStory[]
  primaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
}

export function LoveStoryTimeline({ stories, primaryColor, accentColor, textColor, backgroundColor }: LoveStoryTimelineProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  if (stories.length === 0) return null

  return (
    <section ref={ref} className="py-24 px-6" style={{ backgroundColor }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.4em] mb-4" style={{ color: primaryColor }}>
            Our Journey
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ color: textColor }}>
            Love Story
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }}></div>
            <Heart size={16} fill={accentColor} style={{ color: accentColor }} />
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }}></div>
          </div>
        </motion.div>

        <div className="relative">
          <div 
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2"
            style={{ backgroundColor: `${primaryColor}30` }}
          ></div>

          <div className="space-y-16">
            {stories.map((story, index) => {
              const isEven = index % 2 === 0
              return (
                <motion.div
                  key={story.id}
                  className={`relative flex items-start gap-6 md:gap-12 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Heart size={14} fill="white" style={{ color: 'white' }} />
                    </div>
                  </div>

                  <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} pl-12 md:pl-0`}>
                    {story.image_url && story.image_url.trim() !== '' && (
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-xl">
                        <SafeImage
                          src={story.image_url}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    {story.date && (
                      <div className={`flex items-center gap-2 mb-2 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <Calendar size={14} style={{ color: primaryColor }} />
                        <span className="text-xs uppercase tracking-wider font-medium" style={{ color: primaryColor }}>
                          {new Date(story.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    <h3 className="font-display text-2xl md:text-3xl mb-2" style={{ color: textColor }}>
                      {story.title}
                    </h3>
                    
                    {story.description && (
                      <p className="font-elegant text-base md:text-lg leading-relaxed" style={{ color: textColor, opacity: 0.8 }}>
                        {story.description}
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block flex-1"></div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}