export async function getPresignedUrl(params: {
  filename: string
  contentType: string
  eventId: string
}): Promise<{ url: string; s3Key: string; s3Url: string }> {
  const res = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to get presigned URL')
  }

  return res.json()
}

export async function uploadToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText} — ${text}`)
  }
}
