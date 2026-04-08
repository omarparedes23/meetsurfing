import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventDetailClient } from './EventDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: event }, { data: currentUser }] = await Promise.all([
    supabase.from('cs_events').select('*').eq('id', id).single(),
    supabase.from('cs_users').select('*').eq('id', user.id).single(),
  ])

  if (!event) notFound()

  // Check/create participation
  const { data: participant } = await supabase
    .from('cs_event_participants')
    .select('*')
    .eq('event_id', id)
    .eq('user_id', user.id)
    .single()

  const isParticipant = participant?.status === 'joined'

  return (
    <EventDetailClient
      event={event}
      currentUser={currentUser}
      isParticipant={isParticipant}
    />
  )
}
