// Handles cover-image uploads via ImageKit.
import ImageKit from 'imagekit'
import fs from 'fs/promises'
import path from 'path'
import config from '../config/config.js'

let imagekit = null

const getClient = () => {
  if (!config.imagekit.publicKey || !config.imagekit.privateKey || !config.imagekit.urlEndpoint) {
    throw new Error(
      'ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT in backend/.env'
    )
  }
  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: config.imagekit.publicKey,
      privateKey: config.imagekit.privateKey,
      urlEndpoint: config.imagekit.urlEndpoint,
    })
  }
  return imagekit
}

const hasImageKitConfig = () =>
  Boolean(config.imagekit.publicKey && config.imagekit.privateKey && config.imagekit.urlEndpoint)

const localUploadDirectory = path.resolve(process.cwd(), 'uploads', 'covers')

const saveLocally = async (fileBuffer, fileName) => {
  await fs.mkdir(localUploadDirectory, { recursive: true })
  const extension = path.extname(fileName || '') || '.jpg'
  const localFileName = `${Date.now()}-${crypto.randomUUID()}${extension}`
  await fs.writeFile(path.join(localUploadDirectory, localFileName), fileBuffer)
  return { url: `/uploads/covers/${localFileName}`, fileId: '' }
}

/**
 * Upload a cover image buffer to ImageKit.
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @returns {Promise<{url: string, fileId: string}>}
 */
export const uploadCoverImage = async (fileBuffer, fileName) => {
  if (!hasImageKitConfig()) {
    return saveLocally(fileBuffer, fileName)
  }
  try {
    const client = getClient()
    const result = await client.upload({
      file: fileBuffer,
      fileName: fileName || `cover-${Date.now()}.jpg`,
      folder: '/wavecast/covers',
      useUniqueFileName: true,
    })
    return { url: result.url, fileId: result.fileId }
  } catch (error) {
    console.warn(`ImageKit upload failed; saving cover locally instead: ${error.message || 'unknown error'}`)
    return saveLocally(fileBuffer, fileName)
  }
}

export const deleteCoverImage = async (fileId) => {
  if (!fileId) return
  const client = getClient()
  await client.deleteFile(fileId)
}

export default { uploadCoverImage, deleteCoverImage }
