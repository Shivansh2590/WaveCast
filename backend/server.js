import config from './src/config/config.js'
import app from './src/app.js'

app.listen(config.port, () => {
  console.log(`Wavecast API listening on http://localhost:${config.port}`)
})
