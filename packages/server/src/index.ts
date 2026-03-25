import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import type { ApiError } from '@slidegen/shared'
import { projectRoutes } from './routes/projects.js'
import { generateRoutes } from './routes/generate.js'
import { exportRoutes } from './routes/export.js'
import { templateRoutes } from './routes/templates.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3030'],
}))

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const body: ApiError = {
      error: 'HTTP_ERROR',
      message: err.message,
    }
    return c.json(body, err.status)
  }

  console.error('Unhandled error:', err)
  const body: ApiError = {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  }
  return c.json(body, 500)
})

// Not found handler
app.notFound((c) => {
  const body: ApiError = {
    error: 'NOT_FOUND',
    message: `Route not found: ${c.req.method} ${c.req.path}`,
  }
  return c.json(body, 404)
})

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Routes
app.route('/api/projects', projectRoutes)
app.route('/api/projects', generateRoutes)
app.route('/api/projects', exportRoutes)
app.route('/api/templates', templateRoutes)

const port = Number(process.env.SERVER_PORT) || 3001

console.log(`Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})

export { app }
export type AppType = typeof app
