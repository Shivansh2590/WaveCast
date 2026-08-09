import User from '../models/user.model.js'
import { generateToken, setTokenCookie } from '../utils/generateToken.js'


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are all required.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const user = await User.create({ name, email, password, role: 'listener' })
    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.status(201).json({ user: user.toSafeObject(), token })
  } catch (err) {
    res.status(500).json({ message: 'Could not create account.', error: err.message })
  }
}


export const registerCreator = async (req, res) => {
  try {
    const { channelName, name, email, password } = req.body

    if (!channelName || !name || !email || !password) {
      return res.status(400).json({ message: 'Channel name, your name, email and password are required.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const user = await User.create({ name, email, password, role: 'creator', channelName })
    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.status(201).json({ user: user.toSafeObject(), token })
  } catch (err) {
    res.status(500).json({ message: 'Could not create creator account.', error: err.message })
  }
}


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.status(200).json({ user: user.toSafeObject(), token })
  } catch (err) {
    res.status(500).json({ message: 'Could not sign in.', error: err.message })
  }
}


export const logoutUser = async (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ message: 'Signed out.' })
}


export const getMe = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() })
}


export const updateProfile = async (req, res) => {
  try {
    const { name, channelName, avatarUrl } = req.body

    if (name !== undefined) req.user.name = name
    if (channelName !== undefined) req.user.channelName = channelName
    if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl

    await req.user.save()
    res.status(200).json({ user: req.user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Could not update profile.', error: err.message })
  }
}


export const becomeCreator = async (req, res) => {
  try {
    const { channelName } = req.body
    req.user.role = 'creator'
    req.user.channelName = channelName || req.user.name
    await req.user.save()
    res.status(200).json({ user: req.user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Could not upgrade to a creator account.', error: err.message })
  }
}

export default {
  registerUser,
  registerCreator,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  becomeCreator,
}
