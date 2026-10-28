import serverless from 'serverless-http'
import app from './app.js'

const proxy = serverless(app)

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  return proxy(event, context)
}
