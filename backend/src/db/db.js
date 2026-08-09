import mongoose from 'mongoose'
import config from '../config/config.js'

export const connectDB = async () => {
  if (!config.mongoUri) {
    console.error('MONGODB_URI is not set in .env — cannot connect to the database.')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(config.mongoUri)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

export default connectDB
