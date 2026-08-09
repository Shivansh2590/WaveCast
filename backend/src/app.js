import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import config from './config/config.js'
import authRouter from './routes/auth.router.js'
import userRouter from './routes/user.router.js'
import podcastRouter from './routes/podcast.router.js'

const app = express()

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Wavecast API is running.' })
})

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/podcasts', podcastRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

// Central error handler (multer errors, thrown service errors, etc.)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong on the server.' })
})

export default app
