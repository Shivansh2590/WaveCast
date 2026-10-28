import { randomUUID } from 'crypto'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import config from '../config/config.js'
import { s3 } from '../db/aws.js'

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
const allowedAudioTypes = new Set([
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/x-pn-wav',
  'audio/vnd.wave', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/webm',
  'video/webm', 'video/mp4', 'application/octet-stream',
])

export const createUploadUrl = async ({ userId, type, fileName, contentType, fileSize, podcastId }) => {
  if (!config.mediaBucket) throw new Error('MEDIA_BUCKET is not configured.')
  const allowed = type === 'cover' ? allowedImageTypes : type === 'audio' ? allowedAudioTypes : null
  if (!allowed || !allowed.has(contentType)) {
    const error = new Error('Unsupported media type.')
    error.status = 400
    throw error
  }
  const maxSize = type === 'cover' ? 5 * 1024 * 1024 : 100 * 1024 * 1024
  if (!Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > maxSize) {
    const error = new Error(`File must be between 1 byte and ${type === 'cover' ? '5MB' : '100MB'}.`)
    error.status = 400
    throw error
  }
  const extension = String(fileName || '').split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
  const prefix = type === 'cover' ? `covers/${userId}` : `episodes/${userId}/${podcastId || 'new'}`
  const key = `${prefix}/${randomUUID()}${extension ? `.${extension}` : ''}`
  const command = new PutObjectCommand({
    Bucket: config.mediaBucket,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 })
  return { key, uploadUrl, expiresIn: 900 }
}

export const getMediaUrl = (key) => key
  ? getSignedUrl(s3, new GetObjectCommand({ Bucket: config.mediaBucket, Key: key }), { expiresIn: 43200 })
  : Promise.resolve('')

export const withMediaUrls = async (item, fields) => {
  const pairs = await Promise.all(fields.map(async ([keyField, urlField]) => [urlField, await getMediaUrl(item[keyField])]))
  return Object.assign({}, item, Object.fromEntries(pairs))
}
