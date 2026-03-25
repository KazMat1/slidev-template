import { Hono } from 'hono'
import { z } from 'zod'
import { createProject, getProject, getSlides, saveSlides, updateProject, listProjects, deleteProject } from '../services/storage.js'
import { syncToSlidevDebounced } from '../services/slidev-sync.js'
import type { GenerationSettings } from '@slidegen/shared'

const projectRoutes = new Hono()

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  inputText: z.string().min(1).max(10000),
  templateId: z.string().min(1),
  settings: z.object({
    language: z.enum(['ja', 'en']),
    slideCount: z.number().int().min(3).max(50).nullable(),
    theme: z.string().default('default'),
    additionalInstructions: z.string().optional(),
  }),
})

// POST /api/projects
projectRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const result = createProjectSchema.safeParse(body)
  if (!result.success) {
    return c.json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    }, 400)
  }

  const project = createProject(result.data)
  return c.json(project, 201)
})

// GET /api/projects (list all projects) - T037
projectRoutes.get('/', async (c) => {
  const projects = listProjects()
  return c.json({ projects })
})

// GET /api/projects/:id (project detail) - T038
projectRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  // Skip if this looks like a sub-route (slides, export, generate)
  if (id === 'slides' || id === 'export' || id === 'generate') {
    return c.notFound()
  }
  const project = getProject(id)
  if (!project) {
    return c.json({ error: 'NOT_FOUND', message: 'Project not found' }, 404)
  }
  return c.json(project)
})

// GET /api/projects/:id/slides
projectRoutes.get('/:id/slides', async (c) => {
  const id = c.req.param('id')
  const project = getProject(id)
  if (!project) {
    return c.json({ error: 'NOT_FOUND', message: 'Project not found' }, 404)
  }

  const markdown = getSlides(id)
  if (!markdown) {
    return c.json({ error: 'NOT_FOUND', message: 'Slides not generated yet' }, 404)
  }

  const slideCount = (markdown.match(/^---$/gm) || []).length + 1
  return c.json({ markdown, slideCount })
})

// PUT /api/projects/:id/slides
projectRoutes.put('/:id/slides', async (c) => {
  const id = c.req.param('id')
  const project = getProject(id)
  if (!project) {
    return c.json({ error: 'NOT_FOUND', message: 'Project not found' }, 404)
  }

  const body = await c.req.json()
  const markdown = body?.markdown
  if (typeof markdown !== 'string') {
    return c.json({ error: 'VALIDATION_ERROR', message: 'markdown field is required', details: [] }, 400)
  }

  saveSlides(id, markdown)
  syncToSlidevDebounced(markdown)
  updateProject(id, { status: 'editing' })

  const slideCount = (markdown.match(/^---$/gm) || []).length + 1
  return c.json({
    markdown,
    slideCount,
    updatedAt: new Date().toISOString(),
  })
})

// DELETE /api/projects/:id (delete project) - T039
projectRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = deleteProject(id)
  if (!deleted) {
    return c.json({ error: 'NOT_FOUND', message: 'Project not found' }, 404)
  }
  return c.body(null, 204)
})

export { projectRoutes }
