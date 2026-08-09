import { Router } from 'express'
import {
  registerUser,
  registerCreator,
  loginUser,
  logoutUser,
} from '../controllers/user.controller.js'

const router = Router()


router.post('/register', registerUser)
router.post('/login', loginUser)


router.post('/creator/register', registerCreator)
router.post('/creator/login', loginUser)


router.post('/logout', logoutUser)

export default router
