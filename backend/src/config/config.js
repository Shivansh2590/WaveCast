import dotenv from 'dotenv'
dotenv.config()

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  usersTable: process.env.USERS_TABLE || 'wavecast-users',
  emailLocksTable: process.env.EMAIL_LOCKS_TABLE || 'wavecast-email-locks',
  podcastsTable: process.env.PODCASTS_TABLE || 'wavecast-podcasts',
  episodesTable: process.env.EPISODES_TABLE || 'wavecast-episodes',
  subscriptionsTable: process.env.SUBSCRIPTIONS_TABLE || 'wavecast-subscriptions',
  mediaBucket: process.env.MEDIA_BUCKET,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

}

export default config
