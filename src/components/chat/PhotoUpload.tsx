'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { getPresignedUrl, uploadToS3 } from '@/lib/s3/upload'
import type { Event } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  event: Event
  onUploaded: (
    s3Key: string,
    s3Url: string,
    meta: { size_bytes: number; mime_type: string; width?: number; height?: number }
  ) => Promise<boolean>
  disabled?: boolean
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function PhotoUpload({ event, onUploaded, disabled }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE) {
      alert('File too large. Max size is 10MB.')
      return
    }

    setUploading(true)

    try {
      // Get dimensions
      let width: number | undefined
      let height: number | undefined
      if (file.type.startsWith('image/')) {
        const img = await createImageBitmap(file)
        width = img.width
        height = img.height
      }

      // 1. Get presigned URL from our API
      const { url, s3Key, s3Url } = await getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        eventId: event.id,
      })

      // 2. Upload directly to S3
      await uploadToS3(url, file)

      // 3. Save to Supabase
      await onUploaded(s3Key, s3Url, {
        size_bytes: file.size,
        mime_type: file.type,
        width,
        height,
      })
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
          disabled || uploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImagePlus className="w-4 h-4" />
        )}
      </button>
    </>
  )
}
