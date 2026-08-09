import mongoose from 'mongoose'

const podcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    accentColor: { type: String, default: '#f97316' },
    coverImageUrl: { type: String, default: '' },
    coverImageFileId: { type: String, default: '' }, // ImageKit file id, for deletion
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriberCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Podcast = mongoose.model('Podcast', podcastSchema)
export default Podcast
