import { Router } from 'express'
import { getMe, updateProfile, becomeCreator } from '../controllers/user.controller.js'
import { protect } from '../middleware/protected.middleware.js'

const router = Router()

router.get('/me', protect, getMe)
router.patch('/me', protect, updateProfile)
router.patch('/me/become-creator', protect, becomeCreator)

export default router
