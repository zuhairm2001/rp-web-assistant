import { Hono } from 'hono'
import chat from './routes/chatRoutes'

const app = new Hono().basePath('/api')

app.get('/', async(c) => {
  return c.text('Hello World')
})

app.route('/', chat)

export default app
