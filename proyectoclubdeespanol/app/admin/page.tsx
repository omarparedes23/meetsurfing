'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { GalleryImage, Event } from '@/types'
import {
  Upload,
  Trash2,
  LogOut,
  ImageIcon,
  Calendar,
  Plus,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react'

const BUCKET = 'clubdeespanol'

/** Extracts the storage path from a Supabase public URL */
function getStoragePath(publicUrl: string): string {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  return idx !== -1 ? decodeURIComponent(publicUrl.slice(idx + marker.length)) : ''
}

const inputCls =
  'w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E63946]/50 transition-colors'

type Tab = 'gallery' | 'events'
type FlashMsg = { type: 'success' | 'error'; text: string } | null

const EMPTY_EVENT_FORM = {
  title: '',
  description: '',
  date: '',
  location_name: 'Casa Agave',
  location_url: '',
  type: 'friday' as 'friday' | 'party',
  price: '0',
  telegram_bot_link: '',
}

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('gallery')

  // Gallery
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadCaption, setUploadCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Events
  const [events, setEvents] = useState<Event[]>([])
  const [submittingEvent, setSubmittingEvent] = useState(false)
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM)
  const coverFileRef = useRef<HTMLInputElement>(null)

  // Flash
  const [flash, setFlash] = useState<FlashMsg>(null)

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin/login')
      } else {
        setChecking(false)
        fetchImages()
        fetchEvents()
      }
    })
  }, [router])

  // ── Data fetchers ─────────────────────────────────────────────────────────
  const fetchImages = useCallback(async () => {
    setLoadingImages(true)
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    setImages(data ?? [])
    setLoadingImages(false)
  }, [])

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)
    setEvents(data ?? [])
  }, [])

  // ── Flash helper ──────────────────────────────────────────────────────────
  function showFlash(msg: FlashMsg) {
    setFlash(msg)
    if (msg) setTimeout(() => setFlash(null), 4500)
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  // ── Gallery: upload ───────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    showFlash(null)

    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file)
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

      const { error: dbErr } = await supabase.from('gallery').insert({
        image_url: publicUrl,
        caption: uploadCaption.trim() || null,
        event_id: null,
      })
      if (dbErr) throw dbErr

      showFlash({ type: 'success', text: 'Imagen subida correctamente.' })
      setUploadCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchImages()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la imagen.'
      showFlash({ type: 'error', text: msg })
    } finally {
      setUploading(false)
    }
  }

  // ── Gallery: delete ───────────────────────────────────────────────────────
  async function handleDeleteImage(img: GalleryImage) {
    if (!confirm('¿Eliminar esta imagen permanentemente?')) return

    const { error: dbErr } = await supabase.from('gallery').delete().eq('id', img.id)
    if (dbErr) { showFlash({ type: 'error', text: dbErr.message }); return }

    const storagePath = getStoragePath(img.image_url)
    if (storagePath) await supabase.storage.from(BUCKET).remove([storagePath])

    showFlash({ type: 'success', text: 'Imagen eliminada.' })
    setImages((prev) => prev.filter((i) => i.id !== img.id))
  }

  // ── Events: create ────────────────────────────────────────────────────────
  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingEvent(true)
    showFlash(null)

    try {
      let cover_image_url: string | null = null
      const coverFile = coverFileRef.current?.files?.[0]

      if (coverFile) {
        const ext = coverFile.name.split('.').pop() ?? 'jpg'
        const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, coverFile)
        if (uploadErr) throw uploadErr
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
        cover_image_url = publicUrl
      }

      const { error: dbErr } = await supabase.from('events').insert({
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        date: new Date(eventForm.date).toISOString(),
        location_name: eventForm.location_name.trim(),
        location_url: eventForm.location_url.trim() || null,
        type: eventForm.type,
        price: parseFloat(eventForm.price) || 0,
        telegram_bot_link: eventForm.telegram_bot_link.trim() || null,
        image_url: cover_image_url,
      })
      if (dbErr) throw dbErr

      showFlash({ type: 'success', text: 'Evento creado correctamente.' })
      setEventForm(EMPTY_EVENT_FORM)
      if (coverFileRef.current) coverFileRef.current.value = ''
      await fetchEvents()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear el evento.'
      showFlash({ type: 'error', text: msg })
    } finally {
      setSubmittingEvent(false)
    }
  }

  // ── Events: delete ────────────────────────────────────────────────────────
  async function handleDeleteEvent(eventId: string) {
    if (!confirm('¿Eliminar este evento?')) return
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) { showFlash({ type: 'error', text: error.message }); return }
    showFlash({ type: 'success', text: 'Evento eliminado.' })
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId))
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E63946]" size={32} />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* ── Admin Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0F]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E63946]/15 border border-[#E63946]/30 flex items-center justify-center">
              <span className="text-[#E63946] font-bold text-sm leading-none">A</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">Admin Panel</p>
              <p className="text-[10px] text-gray-500 leading-tight">Spanish Club Moscow</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-white text-xs transition-colors"
            >
              <ExternalLink size={13} />
              Ver sitio
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Flash message ── */}
        {flash && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border text-sm flex items-center justify-between gap-3 ${flash.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
          >
            <span>{flash.text}</span>
            <button onClick={() => setFlash(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1.5 mb-8 p-1 rounded-xl bg-[#12121A] border border-white/10 w-fit">
          {(['gallery', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab === 'gallery' ? <ImageIcon size={15} /> : <Calendar size={15} />}
              {tab === 'gallery' ? 'Galería' : 'Eventos'}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════
            GALLERY TAB
        ════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">

            {/* Upload form */}
            <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
                <Upload size={16} className="text-[#E63946]" />
                Subir nueva foto
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Imagen{' '}
                    <span className="text-gray-600 text-xs">(JPG, PNG, WEBP)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-[#E63946]/10 file:text-[#E63946]
                      hover:file:bg-[#E63946]/20 file:cursor-pointer disabled:opacity-50
                      cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Pie de foto{' '}
                    <span className="text-gray-600 text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Ej: Noche especial en Casa Agave • Особый вечер"
                    className={inputCls}
                  />
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    Subiendo imagen al Storage...
                  </div>
                )}
              </div>
            </div>

            {/* Image grid */}
            <div>
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-400" />
                Fotos en galería
                <span className="text-gray-600 font-normal text-sm">({images.length})</span>
              </h2>

              {loadingImages ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-gray-600" size={24} />
                </div>
              ) : images.length === 0 ? (
                <div className="bg-[#12121A] border border-white/10 border-dashed rounded-2xl p-16 text-center text-gray-600 text-sm">
                  No hay imágenes en la galería todavía.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-[#12121A] border border-white/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt={img.caption ?? ''}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteImage(img)}
                          className="p-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 transition-colors"
                          title="Eliminar imagen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {/* Caption */}
                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-black/70 text-xs text-gray-300 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            EVENTS TAB
        ════════════════════════════════════════════ */}
        {activeTab === 'events' && (
          <div className="space-y-8">

            {/* Create event form */}
            <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
                <Plus size={16} className="text-[#E63946]" />
                Crear nuevo evento
              </h2>

              <form onSubmit={handleEventSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">Título *</label>
                    <input
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Viernes de español · Пятница испанского"
                      className={inputCls}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">Descripción *</label>
                    <textarea
                      required
                      rows={3}
                      value={eventForm.description}
                      onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Descripción del evento..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Fecha y hora *</label>
                    <input
                      required
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                      className={inputCls}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Tipo *</label>
                    <select
                      required
                      value={eventForm.type}
                      onChange={(e) =>
                        setEventForm((p) => ({
                          ...p,
                          type: e.target.value as 'friday' | 'party',
                          price: e.target.value === 'friday' ? '0' : p.price,
                        }))
                      }
                      className={inputCls}
                    >
                      <option value="friday">Viernes libre (Friday)</option>
                      <option value="party">Fiesta especial (Party)</option>
                    </select>
                  </div>

                  {/* Location name */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Lugar *</label>
                    <input
                      required
                      value={eventForm.location_name}
                      onChange={(e) => setEventForm((p) => ({ ...p, location_name: e.target.value }))}
                      placeholder="Casa Agave"
                      className={inputCls}
                    />
                  </div>

                  {/* Location URL */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      URL del mapa{' '}
                      <span className="text-gray-600 text-xs">(opcional)</span>
                    </label>
                    <input
                      value={eventForm.location_url}
                      onChange={(e) => setEventForm((p) => ({ ...p, location_url: e.target.value }))}
                      placeholder="https://yandex.ru/maps/..."
                      className={inputCls}
                    />
                  </div>

                  {/* Price + Telegram — only for party events */}
                  {eventForm.type === 'party' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Precio (RUB)</label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={eventForm.price}
                          onChange={(e) => setEventForm((p) => ({ ...p, price: e.target.value }))}
                          placeholder="1500"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                          Link de pago Telegram{' '}
                          <span className="text-gray-600 text-xs">(opcional)</span>
                        </label>
                        <input
                          value={eventForm.telegram_bot_link}
                          onChange={(e) =>
                            setEventForm((p) => ({ ...p, telegram_bot_link: e.target.value }))
                          }
                          placeholder="https://t.me/bot..."
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {/* Cover image */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Imagen de portada{' '}
                      <span className="text-gray-600 text-xs">(opcional)</span>
                    </label>
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                        file:text-sm file:font-medium file:bg-[#E63946]/10 file:text-[#E63946]
                        hover:file:bg-[#E63946]/20 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submittingEvent}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#E63946]/80 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    {submittingEvent ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Plus size={15} />
                    )}
                    Crear evento
                  </button>
                </div>
              </form>
            </div>

            {/* Events list */}
            <div>
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                Todos los eventos
                <span className="text-gray-600 font-normal text-sm">({events.length})</span>
              </h2>

              {events.length === 0 ? (
                <div className="bg-[#12121A] border border-white/10 border-dashed rounded-2xl p-16 text-center text-gray-600 text-sm">
                  No hay eventos creados todavía.
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#12121A] border border-white/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      {event.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.image_url}
                          alt=""
                          className="w-16 h-12 object-cover rounded-lg flex-shrink-0 border border-white/10"
                          loading="lazy"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.type === 'friday'
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-[#F1C40F]/15 text-[#F1C40F]'
                              }`}
                          >
                            {event.type === 'friday' ? 'Viernes' : 'Fiesta'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('es', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {event.price > 0 && (
                            <span className="text-xs text-gray-500">{event.price} RUB</span>
                          )}
                        </div>
                        <p className="text-white font-medium text-sm truncate">{event.title}</p>
                        <p className="text-gray-500 text-xs truncate">{event.location_name}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                        title="Eliminar evento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
