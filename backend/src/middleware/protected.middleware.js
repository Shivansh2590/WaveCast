import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import User from '../models/user.model.js'


export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please sign in.' })
    }

    const decoded = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' })
  }
}


export const requireCreator = (req, res, next) => {
  if (req.user?.role !== 'creator') {
    return res.status(403).json({ message: 'This action requires a creator account.' })
  }
  next()
}

export default { protect, requireCreator }
