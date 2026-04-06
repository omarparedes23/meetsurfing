import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3'

export async function POST(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const { data: rows, error } = await supabase.rpc('lock_inactive_events', {
    inactivity_hours: 2,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let totalDeleted = 0
  const eventsLocked = rows?.length ?? 0

  for (const row of rows ?? []) {
    const keys: string[] = row.s3_keys ?? []
    if (keys.length === 0) continue

    try {
      await s3.send(new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Delete: {
          Objects: keys.map((k: string) => ({ Key: k })),
          Quiet: true,
        },
      }))
      totalDeleted += keys.length
    } catch (err) {
      console.error(`Failed to delete S3 objects for event ${row.event_id}:`, err)
    }
  }

  console.log(`[cleanup] Locked ${eventsLocked} events, deleted ${totalDeleted} photos`)

  return NextResponse.json({
    eventsLocked,
    photosDeleted: totalDeleted,
    timestamp: new Date().toISOString(),
  })
}
