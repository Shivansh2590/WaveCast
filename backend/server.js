import config from './src/config/config.js'
import connectDB from './src/db/db.js'
import app from './src/app.js'

const start = async () => {
  await connectDB()

  app.listen(config.port, () => {
    console.log(`Wavecast API listening on http://localhost:${config.port}`)
  })
}

start()
