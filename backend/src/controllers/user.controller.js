import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { findUserByEmail, tables, updateItem, dynamo, TransactWriteCommand } from '../services/data.service.js'
import { generateToken, setTokenCookie } from '../utils/generateToken.js'

const safeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  channelName: user.channelName || '',
  avatarUrl: user.avatarUrl || '',
})

const register = async (req, res, role) => {
  try {
    const { name, email, password, channelName } = req.body
    if (!name || !email || !password || (role === 'creator' && !channelName)) {
      return res.status(400).json({ message: role === 'creator'
        ? 'Channel name, your name, email and password are required.'
        : 'Name, email and password are all required.' })
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    const normalizedEmail = email.trim().toLowerCase()
    if (await findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }
    const id = randomUUID()
    const now = new Date().toISOString()
    const user = {
      id, _id: id, name: name.trim(), email: normalizedEmail,
      password: await bcrypt.hash(password, 10), role,
      channelName: role === 'creator' ? channelName.trim() : '', avatarUrl: '',
      createdAt: now, updatedAt: now,
    }
    await dynamo.send(new TransactWriteCommand({ TransactItems: [
      { Put: { TableName: tables.emailLocks, Item: { email: normalizedEmail, userId: id }, ConditionExpression: 'attribute_not_exists(email)' } },
      { Put: { TableName: tables.users, Item: user, ConditionExpression: 'attribute_not_exists(id)' } },
    ] }))
    const token = generateToken(id)
    setTokenCookie(res, token)
    return res.status(201).json({ user: safeUser(user), token })
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException' || err.name === 'TransactionCanceledException') return res.status(409).json({ message: 'An account with this email already exists.' })
    return res.status(500).json({ message: 'Could not create account.', error: err.message })
  }
}

export const registerUser = (req, res) => register(req, res, 'listener')
export const registerCreator = (req, res) => register(req, res, 'creator')

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
    const user = await findUserByEmail(email.trim().toLowerCase())
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    const token = generateToken(user._id)
    setTokenCookie(res, token)
    return res.status(200).json({ user: safeUser(user), token })
  } catch (err) {
    return res.status(500).json({ message: 'Could not sign in.', error: err.message })
  }
}

export const logoutUser = (req, res) => {
  res.clearCookie('token', { secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' })
  return res.status(200).json({ message: 'Signed out.' })
}

export const getMe = (req, res) => res.status(200).json({ user: safeUser(req.user) })

export const updateProfile = async (req, res) => {
  try {
    const { name, channelName, avatarUrl } = req.body
    const names = { '#updatedAt': 'updatedAt' }
    const values = { ':updatedAt': new Date().toISOString() }
    const sets = ['#updatedAt = :updatedAt']
    for (const [field, value] of Object.entries({ name, channelName, avatarUrl })) {
      if (value !== undefined) {
        names[`#${field}`] = field
        values[`:${field}`] = value
        sets.push(`#${field} = :${field}`)
      }
    }
    const result = await updateItem(tables.users, { id: req.user._id }, `SET ${sets.join(', ')}`, names, values)
    req.user = result.Attributes
    return res.status(200).json({ user: safeUser(req.user) })
  } catch (err) {
    return res.status(500).json({ message: 'Could not update profile.', error: err.message })
  }
}

export const becomeCreator = async (req, res) => {
  try {
    const channelName = req.body.channelName || req.user.name
    const result = await updateItem(tables.users, { id: req.user._id },
      'SET #role = :role, #channelName = :channelName, #updatedAt = :updatedAt',
      { '#role': 'role', '#channelName': 'channelName', '#updatedAt': 'updatedAt' },
      { ':role': 'creator', ':channelName': channelName, ':updatedAt': new Date().toISOString() })
    return res.status(200).json({ user: safeUser(result.Attributes) })
  } catch (err) {
    return res.status(500).json({ message: 'Could not upgrade to a creator account.', error: err.message })
  }
}

export { safeUser }

export default { registerUser, registerCreator, loginUser, logoutUser, getMe, updateProfile, becomeCreator }
