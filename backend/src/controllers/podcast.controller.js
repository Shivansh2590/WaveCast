import Podcast from '../models/podcast.model.js'
import Episode from '../models/episode.model.js'
import { uploadCoverImage, deleteCoverImage } from '../services/imagekit.service.js'
import { uploadEpisodeAudio, deleteEpisodeAudio } from '../services/cloudinary.service.js'

const publicUploadUrl = (req, url) =>
  url.startsWith('/') ? `${req.protocol}://${req.get('host')}${url}` : url

// GET /api/podcasts  (public feed, supports ?category=&search=)
export const getPodcasts = async (req, res) => {
  try {
    const { category, search } = req.query
    const filter = {}
    if (category && category !== 'all') filter.category = category
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ]
    }
    const podcasts = await Podcast.find(filter).sort({ createdAt: -1 })
    res.status(200).json({ podcasts })
  } catch (err) {
    res.status(500).json({ message: 'Could not load podcasts.', error: err.message })
  }
}

// GET /api/podcasts/mine  (creator's own shows)
export const getMyPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ creator: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json({ podcasts })
  } catch (err) {
    res.status(500).json({ message: 'Could not load your podcasts.', error: err.message })
  }
}

// GET /api/podcasts/:id  (details + episode list)
export const getPodcastById = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id).populate('creator', 'name channelName')
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })

    const episodes = await Episode.find({ podcast: podcast._id }).sort({ episodeNumber: -1 })
    res.status(200).json({ podcast, episodes })
  } catch (err) {
    res.status(500).json({ message: 'Could not load this podcast.', error: err.message })
  }
}

// POST /api/podcasts  (creator only, multipart: coverImage file + fields)
export const createPodcast = async (req, res) => {
  try {
    const { title, author, description, category, tags, accentColor } = req.body

    if (!title || !author || !description || !category) {
      return res.status(400).json({ message: 'Title, author, description and category are required.' })
    }

    let coverImageUrl = ''
    let coverImageFileId = ''
    if (req.file) {
      const uploaded = await uploadCoverImage(req.file.buffer, req.file.originalname)
      coverImageUrl = publicUploadUrl(req, uploaded.url)
      coverImageFileId = uploaded.fileId
    }

    const podcast = await Podcast.create({
      title,
      author,
      description,
      category,
      tags: tags ? JSON.parse(tags) : [],
      accentColor,
      coverImageUrl,
      coverImageFileId,
      creator: req.user._id,
    })

    res.status(201).json({ podcast })
  } catch (err) {
    res.status(500).json({ message: 'Could not create podcast.', error: err.message })
  }
}

// DELETE /api/podcasts/:id  (creator only, must own it)
export const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (String(podcast.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own podcasts.' })
    }

    await deleteCoverImage(podcast.coverImageFileId)

    const episodes = await Episode.find({ podcast: podcast._id })
    for (const ep of episodes) {
      await deleteEpisodeAudio(ep.audioPublicId)
    }
    await Episode.deleteMany({ podcast: podcast._id })
    await podcast.deleteOne()

    res.status(200).json({ message: 'Podcast deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Could not delete podcast.', error: err.message })
  }
}

// POST /api/podcasts/:id/episodes  (creator only, multipart: audio file + fields)
export const createEpisode = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (String(podcast.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only add episodes to your own podcasts.' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'An audio file is required.' })
    }

    const { title, description } = req.body
    if (!title) return res.status(400).json({ message: 'Episode title is required.' })

    const uploaded = await uploadEpisodeAudio(req.file.buffer, req.file.originalname)
    const episodeCount = await Episode.countDocuments({ podcast: podcast._id })

    const episode = await Episode.create({
      podcast: podcast._id,
      episodeNumber: episodeCount + 1,
      title,
      description: description || '',
      audioUrl: publicUploadUrl(req, uploaded.url),
      audioPublicId: uploaded.publicId,
      durationSeconds: uploaded.durationSeconds,
    })

    res.status(201).json({ episode })
  } catch (err) {
    res.status(500).json({ message: 'Could not publish episode.', error: err.message })
  }
}

// DELETE /api/podcasts/:id/episodes/:episodeId  (creator only, must own show)
export const deleteEpisode = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (String(podcast.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete episodes from your own podcasts.' })
    }

    const episode = await Episode.findOne({ _id: req.params.episodeId, podcast: podcast._id })
    if (!episode) return res.status(404).json({ message: 'Episode not found.' })

    await deleteEpisodeAudio(episode.audioPublicId)
    await episode.deleteOne()
    res.status(200).json({ message: 'Episode deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Could not delete episode.', error: err.message })
  }
}

// POST /api/podcasts/:id/subscribe  (toggles subscription for the logged-in listener)
export const toggleSubscribe = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })

    const alreadySubscribed = req.user.subscribedPodcasts.some(
      (id) => String(id) === String(podcast._id)
    )

    if (alreadySubscribed) {
      req.user.subscribedPodcasts = req.user.subscribedPodcasts.filter(
        (id) => String(id) !== String(podcast._id)
      )
      podcast.subscriberCount = Math.max(0, podcast.subscriberCount - 1)
    } else {
      req.user.subscribedPodcasts.push(podcast._id)
      podcast.subscriberCount += 1
    }

    await req.user.save()
    await podcast.save()

    res.status(200).json({ subscribed: !alreadySubscribed, subscriberCount: podcast.subscriberCount })
  } catch (err) {
    res.status(500).json({ message: 'Could not update subscription.', error: err.message })
  }
}

export default {
  getPodcasts,
  getMyPodcasts,
  getPodcastById,
  createPodcast,
  deletePodcast,
  createEpisode,
  deleteEpisode,
  toggleSubscribe,
}
