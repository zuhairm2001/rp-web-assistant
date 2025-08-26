import { Hono } from 'hono'
import chat from './routes/chatRoutes'

const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/', chat)

export default app
