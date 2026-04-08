import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Star, Calendar, Globe } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('cs_users')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwn = authUser?.id === profile.id

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Hero */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatar_url} name={profile.username} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {profile.full_name ?? profile.username}
            </h1>
            <p className="text-gray-500 text-sm">@{profile.username}</p>
            {profile.total_reviews > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{profile.avg_rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({profile.total_reviews} reviews)</span>
              </div>
            )}
          </div>
          {isOwn && (
            <Link
              href="/profile/edit"
              className="text-xs text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
            >
              Edit
            </Link>
          )}
        </div>

        {profile.bio && (
          <p className="text-gray-600 text-sm mt-4 leading-relaxed">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          {profile.city && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="w-3 h-3" />
              {profile.city}{profile.country ? `, ${profile.country}` : ''}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            Joined {format(new Date(profile.created_at), 'MMM yyyy')}
          </span>
        </div>

        {profile.languages && profile.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {profile.languages.map((lang: string) => (
              <span key={lang} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
