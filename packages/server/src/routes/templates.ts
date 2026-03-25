import { Hono } from 'hono'
import { getAllTemplates } from '@slidegen/generator'

const templateRoutes = new Hono()

// GET /api/templates
templateRoutes.get('/', (c) => {
  const templates = getAllTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    layoutSequence: t.layoutSequence,
    components: t.components,
  }))

  return c.json({ templates })
})

export { templateRoutes }
