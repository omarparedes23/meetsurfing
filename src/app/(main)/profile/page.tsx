import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProfileRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's username
  const { data: profile } = await supabase
    .from('cs_users')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  redirect(`/profile/${profile.username}`)
}
