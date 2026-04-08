'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryImage } from '@/types'

interface PhotoGridProps {
  images: GalleryImage[]
}

export default function PhotoGrid({ images }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % images.length)
  }

  const goPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-dark-surface flex items-center justify-center mb-4">
          <span className="text-4xl">📷</span>
        </div>
        <p className="text-gray-400 text-lg font-medium mb-2">
          Galería en construcción
        </p>
        <p className="text-gray-600 text-sm">
          Pronto publicaremos fotos de nuestros eventos · Скоро опубликуем фото
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Masonry-style grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: (index % 8) * 0.06 }}
            className="break-inside-avoid"
          >
            <button
              onClick={() => openLightbox(index)}
              className="relative group block w-full overflow-hidden rounded-2xl border border-dark-border hover:border-brand-red/40 transition-all duration-300"
              aria-label={image.caption ?? `Foto ${index + 1}`}
            >
              <div className="relative w-full" style={{ aspectRatio: index % 3 === 0 ? '1' : index % 3 === 1 ? '4/3' : '3/4' }}>
                <Image
                  src={image.image_url}
                  alt={image.caption ?? `Foto del evento ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                <p className="text-white text-xs font-medium line-clamp-2 flex-1">
                  {image.caption}
                </p>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ml-2">
                  <ZoomIn size={14} className="text-white" />
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Prev button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Siguiente"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl max-h-[85vh] w-full px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full" style={{ maxHeight: '80vh' }}>
                <Image
                  src={images[lightboxIndex].image_url}
                  alt={images[lightboxIndex].caption ?? `Foto ${lightboxIndex + 1}`}
                  width={1200}
                  height={900}
                  className="object-contain w-full h-full rounded-2xl"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
              {images[lightboxIndex].caption && (
                <p className="text-center text-gray-300 text-sm mt-4 px-4">
                  {images[lightboxIndex].caption}
                </p>
              )}
              <p className="text-center text-gray-600 text-xs mt-2">
                {lightboxIndex + 1} / {images.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
