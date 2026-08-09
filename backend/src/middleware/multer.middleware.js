import multer from 'multer'

// Keep uploads in memory; we stream straight to Cloudinary/ImageKit rather than touching disk.
const storage = multer.memoryStorage()

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true)
  cb(new Error('Only image files are allowed for the cover image.'))
}

const audioFilter = (req, file, cb) => {
  // Browsers commonly record audio as audio/webm or video/webm. Accept a
  // conservative extension fallback because some devices send a blank MIME type.
  const extension = file.originalname?.split('.').pop()?.toLowerCase()
  const supportedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'mp4']
  if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm' || supportedExtensions.includes(extension)) return cb(null, true)
  cb(new Error('Only audio files (MP3, WAV, M4A) are allowed.'))
}

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})

export default { uploadImage, uploadAudio }
