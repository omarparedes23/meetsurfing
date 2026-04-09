'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, Plus, User, LogOut, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  userId: string
}

export function Navbar({ userId }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/events/new', icon: Plus, label: 'New' },
    { href: '/my-events', icon: MessageCircle, label: 'My' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-gray-900">HangoutSpot</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs transition-colors',
                pathname === href
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Out
          </button>
        </div>
      </div>
    </nav>
  )
}
