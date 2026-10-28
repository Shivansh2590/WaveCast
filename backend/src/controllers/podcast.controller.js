import { randomUUID } from 'crypto'
import { DeleteCommand, GetCommand, TransactWriteCommand, dynamo, getById, getPodcastEpisodes, getCreatorPodcasts, getFeedPodcasts, putItem, tables, updateItem, deletePodcastRecords, deleteMedia, requireUploadedObject } from '../services/data.service.js'
import { createUploadUrl, withMediaUrls } from '../services/media.service.js'

const viewPodcast = (item) => ({ ...item, _id: item.id })
const viewEpisode = (item) => ({ ...item, _id: item.id, podcast: item.podcastId })
const isOwner = (podcast, user) => podcast.creator === user._id

export const requestUploadUrl = async (req, res) => {
  try {
    const { type, fileName, contentType, fileSize, podcastId } = req.body
    if (type === 'audio') {
      if (!podcastId) return res.status(400).json({ message: 'Podcast id is required for audio uploads.' })
      const podcast = await getById(tables.podcasts, podcastId)
      if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
      if (!isOwner(podcast, req.user)) return res.status(403).json({ message: 'You can only upload episodes to your own podcasts.' })
    }
    const result = await createUploadUrl({ userId: req.user._id, type, fileName, contentType, fileSize, podcastId })
    return res.status(200).json(result)
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Could not create upload URL.' })
  }
}

export const getPodcasts = async (req, res) => {
  try {
    const { category, search } = req.query
    const podcasts = await getFeedPodcasts({ category, search })
    const results = await Promise.all(podcasts.map(async (item) => viewPodcast(await withMediaUrls(item, [['coverImageKey', 'coverImageUrl']]))))
    return res.status(200).json({ podcasts: results })
  } catch (err) {
    return res.status(500).json({ message: 'Could not load podcasts.', error: err.message })
  }
}

export const getMyPodcasts = async (req, res) => {
  try {
    const podcasts = await getCreatorPodcasts(req.user._id)
    const results = await Promise.all(podcasts.map(async (item) => viewPodcast(await withMediaUrls(item, [['coverImageKey', 'coverImageUrl']]))))
    return res.status(200).json({ podcasts: results })
  } catch (err) {
    return res.status(500).json({ message: 'Could not load your podcasts.', error: err.message })
  }
}

export const getPodcastById = async (req, res) => {
  try {
    const podcast = await getById(tables.podcasts, req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    const [creator, episodes] = await Promise.all([
      getById(tables.users, podcast.creator),
      getPodcastEpisodes(podcast.id),
    ])
    const [podcastView, episodeViews] = await Promise.all([
      withMediaUrls(podcast, [['coverImageKey', 'coverImageUrl']]),
      Promise.all(episodes.map((item) => withMediaUrls(item, [['audioKey', 'audioUrl']]))),
    ])
    podcastView.creator = creator ? { _id: creator._id, id: creator._id, name: creator.name, channelName: creator.channelName } : null
    return res.status(200).json({ podcast: viewPodcast(podcastView), episodes: episodeViews.map(viewEpisode) })
  } catch (err) {
    return res.status(500).json({ message: 'Could not load this podcast.', error: err.message })
  }
}

export const createPodcast = async (req, res) => {
  try {
    const { title, author, description, category, tags = [], accentColor, coverImageKey = '' } = req.body
    if (!title || !author || !description || !category) {
      return res.status(400).json({ message: 'Title, author, description and category are required.' })
    }
    if (!Array.isArray(tags)) return res.status(400).json({ message: 'Tags must be an array.' })
    if (coverImageKey) {
      if (!coverImageKey.startsWith(`covers/${req.user._id}/`)) return res.status(400).json({ message: 'Invalid cover image key.' })
      await requireUploadedObject(coverImageKey)
    }
    const id = randomUUID()
    const now = new Date().toISOString()
    const podcast = {
      id, _id: id, title: title.trim(), author: author.trim(), description, category,
      tags, accentColor: accentColor || '#f97316', coverImageKey, coverImageUrl: '',
      creator: req.user._id, feedPartition: 'PODCAST',
      searchText: `${title} ${author}`.toLocaleLowerCase(),
      subscriberCount: 0, rating: 0, episodeCount: 0,
      createdAt: now, updatedAt: now,
    }
    await putItem(tables.podcasts, podcast, 'attribute_not_exists(id)')
    const withUrl = await withMediaUrls(podcast, [['coverImageKey', 'coverImageUrl']])
    return res.status(201).json({ podcast: viewPodcast(withUrl) })
  } catch (err) {
    return res.status(err.status || 500).json({ message: 'Could not create podcast.', error: err.message })
  }
}

export const deletePodcast = async (req, res) => {
  try {
    const podcast = await getById(tables.podcasts, req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (!isOwner(podcast, req.user)) return res.status(403).json({ message: 'You can only delete your own podcasts.' })
    await deletePodcastRecords(podcast.id, podcast)
    return res.status(200).json({ message: 'Podcast deleted.' })
  } catch (err) {
    return res.status(500).json({ message: 'Could not delete podcast.', error: err.message })
  }
}

export const createEpisode = async (req, res) => {
  try {
    const podcast = await getById(tables.podcasts, req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (!isOwner(podcast, req.user)) return res.status(403).json({ message: 'You can only add episodes to your own podcasts.' })
    const { title, description = '', audioKey } = req.body
    if (!title) return res.status(400).json({ message: 'Episode title is required.' })
    if (!audioKey || !audioKey.startsWith(`episodes/${req.user._id}/${podcast.id}/`)) {
      return res.status(400).json({ message: 'Upload an audio file before publishing.' })
    }
    const head = await requireUploadedObject(audioKey)
    const counter = await updateItem(tables.podcasts, { id: podcast.id },
      'SET #updatedAt = :updatedAt ADD #episodeCount :one',
      { '#episodeCount': 'episodeCount', '#updatedAt': 'updatedAt' },
      { ':one': 1, ':updatedAt': new Date().toISOString() })
    const id = randomUUID()
    const episode = {
      id, _id: id, podcastId: podcast.id, podcast: podcast.id,
      episodeNumber: counter.Attributes.episodeCount, title: title.trim(), description,
      audioKey, audioUrl: '', durationSeconds: 0, contentType: head.ContentType || '',
      createdAt: new Date().toISOString(),
    }
    await putItem(tables.episodes, episode, 'attribute_not_exists(id)')
    const result = await withMediaUrls(episode, [['audioKey', 'audioUrl']])
    return res.status(201).json({ episode: viewEpisode(result) })
  } catch (err) {
    return res.status(err.status || 500).json({ message: 'Could not publish episode.', error: err.message })
  }
}

export const deleteEpisode = async (req, res) => {
  try {
    const podcast = await getById(tables.podcasts, req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (!isOwner(podcast, req.user)) return res.status(403).json({ message: 'You can only delete episodes from your own podcasts.' })
    const episodes = await getPodcastEpisodes(podcast.id)
    const episode = episodes.find((item) => item.id === req.params.episodeId)
    if (!episode) return res.status(404).json({ message: 'Episode not found.' })
    await Promise.all([
      deleteMedia(episode.audioKey),
      dynamo.send(new DeleteCommand({ TableName: tables.episodes, Key: { id: episode.id } })),
    ])
    return res.status(200).json({ message: 'Episode deleted.' })
  } catch (err) {
    return res.status(500).json({ message: 'Could not delete episode.', error: err.message })
  }
}

export const toggleSubscribe = async (req, res) => {
  try {
    const podcast = await getById(tables.podcasts, req.params.id)
    if (!podcast) return res.status(404).json({ message: 'Podcast not found.' })
    if (podcast.creator === req.user._id) return res.status(400).json({ message: 'Creators cannot subscribe to their own podcast.' })
    const key = { userId: req.user._id, podcastId: podcast.id }
    const current = await dynamo.send(new GetCommand({ TableName: tables.subscriptions, Key: key }))
    const subscribing = !current.Item
    const now = new Date().toISOString()
    try {
      await dynamo.send(new TransactWriteCommand({ TransactItems: subscribing ? [
        { Put: { TableName: tables.subscriptions, Item: { ...key, createdAt: now }, ConditionExpression: 'attribute_not_exists(userId)' } },
        { Update: { TableName: tables.podcasts, Key: { id: podcast.id }, UpdateExpression: 'ADD subscriberCount :one', ExpressionAttributeValues: { ':one': 1 } } },
      ] : [
        { Delete: { TableName: tables.subscriptions, Key: key, ConditionExpression: 'attribute_exists(userId)' } },
        { Update: { TableName: tables.podcasts, Key: { id: podcast.id }, UpdateExpression: 'ADD subscriberCount :minusOne', ConditionExpression: 'subscriberCount > :zero', ExpressionAttributeValues: { ':minusOne': -1, ':zero': 0 } } },
      ] }))
    } catch (err) {
      if (err.name === 'TransactionCanceledException') return res.status(409).json({ message: 'Subscription changed in another request. Please try again.' })
      throw err
    }
    return res.status(200).json({ subscribed: subscribing, subscriberCount: Math.max(0, (podcast.subscriberCount || 0) + (subscribing ? 1 : -1)) })
  } catch (err) {
    return res.status(500).json({ message: 'Could not update subscription.', error: err.message })
  }
}

export default { getPodcasts, getMyPodcasts, getPodcastById, createPodcast, deletePodcast, createEpisode, deleteEpisode, toggleSubscribe, requestUploadUrl }
