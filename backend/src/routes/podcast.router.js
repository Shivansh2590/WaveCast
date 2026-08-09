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
} from '../controllers/podcast.controller.js'
import { protect, requireCreator } from '../middleware/protected.middleware.js'
import { uploadImage, uploadAudio } from '../middleware/multer.middleware.js'

const router = Router()

router.get('/', getPodcasts)
router.get('/mine', protect, requireCreator, getMyPodcasts)
router.get('/:id', getPodcastById)

router.post('/', protect, requireCreator, uploadImage.single('coverImage'), createPodcast)
router.delete('/:id', protect, requireCreator, deletePodcast)

router.post('/:id/episodes', protect, requireCreator, uploadAudio.single('audio'), createEpisode)
router.delete('/:id/episodes/:episodeId', protect, requireCreator, deleteEpisode)
router.post('/:id/subscribe', protect, toggleSubscribe)

export default router
