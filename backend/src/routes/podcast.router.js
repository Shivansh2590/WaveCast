import { Router } from 'express'
import {
  getPodcasts,
  getMyPodcasts,
  getPodcastById,
  createPodcast,
  deletePodcast,
  createEpisode,
  deleteEpisode,
  toggleSubscribe,
  requestUploadUrl,
} from '../controllers/podcast.controller.js'
import { protect, requireCreator } from '../middleware/protected.middleware.js'

const router = Router()

router.get('/', getPodcasts)
router.get('/mine', protect, requireCreator, getMyPodcasts)
router.post('/upload-url', protect, requireCreator, requestUploadUrl)
router.get('/:id', getPodcastById)

router.post('/', protect, requireCreator, createPodcast)
router.delete('/:id', protect, requireCreator, deletePodcast)

router.post('/:id/episodes', protect, requireCreator, createEpisode)
router.delete('/:id/episodes/:episodeId', protect, requireCreator, deleteEpisode)
router.post('/:id/subscribe', protect, toggleSubscribe)

export default router
