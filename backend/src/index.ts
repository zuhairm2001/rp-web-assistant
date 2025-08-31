import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import chat from './routes/chatRoutes'

const app = new Hono().basePath('/api')

app.get('/', async(c) => {
  return c.text('Hello World')
})

app.route('/chat', chat)

export default app
