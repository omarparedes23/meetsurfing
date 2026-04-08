import type { Metadata } from 'next'
import { getGalleryImages } from '@/lib/supabase'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import { Camera } from 'lucide-react'
import type { GalleryImage } from '@/types'

// Demo images shown while Supabase gallery is empty
const DEMO_IMAGES: GalleryImage[] = [
  {
    id: 'demo-1',
    event_id: null,
    image_url:
      'https://img.lavdg.com/sc/-dmNuz-HnnMBEFVHTKffMCY63Jc=/768x/2019/12/28/00121577554878646652538/Foto/LF22C8F3.jpg',
    caption: 'Una noche en el club • Вечер в клубе',
    created_at: new Date().toISOString(),
  },
]

export const metadata: Metadata = {
  title: 'Galería | Spanish Club Moscow',
  description:
    'Fotos de los eventos del Spanish Club Moscow. Revive los mejores momentos de nuestras reuniones y fiestas. • Фото с мероприятий клуба испанского языка в Москве.',
  openGraph: {
    title: 'Galería | Spanish Club Moscow',
    description: 'Los mejores momentos de la comunidad latino-rusa de Moscú.',
  },
}

export const revalidate = 600

export default async function GalleryPage() {
  const dbImages = await getGalleryImages(48)
  const images = dbImages.length > 0 ? dbImages : DEMO_IMAGES

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Page header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-sm font-medium mb-6">
            <Camera size={14} />
            Momentos · Моменты
          </span>
          <h1 className="section-title text-4xl md:text-5xl mb-4">
            Nuestra{' '}
            <span className="gradient-text">Galería</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-balance">
            Revive los mejores momentos de nuestra comunidad — noches en Casa Agave, fiestas
            especiales y mucha cultura compartida.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Лучшие моменты нашего сообщества — вечера в Casa Agave, особые вечеринки и культурный обмен.
          </p>
          {images.length > 0 && (
            <p className="text-gray-700 text-xs mt-4">
              {images.length} foto{images.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <PhotoGrid images={images} />
      </div>

      {/* Upload CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-20">
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
          <div className="text-4xl mb-4">📸</div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            ¿Tienes fotos del club?
          </h2>
          <p className="text-gray-400 mb-2">
            Comparte tus mejores momentos con la comunidad.
          </p>
          <p className="text-gray-600 text-sm mb-8">
            Есть фотографии с наших встреч? Поделись с сообществом!
          </p>
          <a
            href="https://t.me/clubdeespanolenmoscu"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Enviar al Telegram del club
          </a>
        </div>
      </div>
    </div>
  )
}
