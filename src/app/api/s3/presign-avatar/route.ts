import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { filename, contentType } = body

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' },
      { status: 400 }
    )
  }

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
  }

  const ext = path.extname(filename).toLowerCase() || '.jpg'
  const s3Key = `avatars/${user.id}/${uuidv4()}${ext}`
  const bucket = process.env.AWS_S3_BUCKET!

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
    Metadata: {
      'uploaded-by': user.id,
      'type': 'avatar',
    },
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 min
  const s3Url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`

  return NextResponse.json({ url, s3Key, s3Url })
}
