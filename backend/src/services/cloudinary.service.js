// Handles episode-audio uploads via Cloudinary.
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import fs from 'fs/promises'
import path from 'path'
import config from '../config/config.js'

let configured = false

const ensureConfigured = () => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env'
    )
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    })
    configured = true
  }
}

const hasCloudinaryConfig = () =>
  Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)

const localUploadDirectory = path.resolve(process.cwd(), 'uploads', 'episodes')

const saveLocally = async (fileBuffer, originalName) => {
  await fs.mkdir(localUploadDirectory, { recursive: true })
  const extension = path.extname(originalName) || '.webm'
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`
  await fs.writeFile(path.join(localUploadDirectory, fileName), fileBuffer)
  return { url: `/uploads/episodes/${fileName}`, publicId: '', durationSeconds: 0 }
}

/**
 * Upload an audio buffer to Cloudinary as a raw/video resource.
 * @param {Buffer} fileBuffer
 * @returns {Promise<{url: string, publicId: string, durationSeconds: number}>}
 */
export const uploadEpisodeAudio = async (fileBuffer, originalName = 'episode.webm') => {
  // Local storage keeps development publishing usable before Cloudinary is set up.
  if (!hasCloudinaryConfig()) {
    return saveLocally(fileBuffer, originalName)
  }
  ensureConfigured()
  try {
    return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'wavecast/episodes' }, // audio goes through the 'video' pipeline on Cloudinary
      (error, result) => {
        if (error) return reject(error)
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          durationSeconds: Math.round(result.duration || 0),
        })
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
    })
  } catch (error) {
    console.warn(`Cloudinary upload failed; saving episode locally instead: ${error.message || 'unknown error'}`)
    return saveLocally(fileBuffer, originalName)
  }
}

export const deleteEpisodeAudio = async (publicId) => {
  if (!publicId) return
  ensureConfigured()
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}

export default { uploadEpisodeAudio, deleteEpisodeAudio }
