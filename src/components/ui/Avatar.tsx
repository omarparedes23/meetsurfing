import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
const px = { sm: 32, md: 40, lg: 64 }

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center font-semibold text-gray-600', sizes[size], className)}>
      {src ? (
        <Image src={src} alt={name} width={px[size]} height={px[size]} className="object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  )
}
