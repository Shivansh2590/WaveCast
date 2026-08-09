import mongoose from 'mongoose'

const episodeSchema = new mongoose.Schema(
  {
    podcast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast',
      required: true,
    },
    episodeNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    audioUrl: { type: String, required: true }, // Cloudinary URL
    audioPublicId: { type: String, default: '' }, // Cloudinary public id, for deletion
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Episode = mongoose.model('Episode', episodeSchema)
export default Episode
