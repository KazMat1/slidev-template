import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { getProject, updateProject, saveSlides } from '../services/storage.js'
import { generateSlides, getTemplate } from '@slidegen/generator'
import { syncToSlidev } from '../services/slidev-sync.js'

const generateRoutes = new Hono()

generateRoutes.post('/:id/generate', async (c) => {
  const id = c.req.param('id')
  const project = getProject(id)
  if (!project) {
    return c.json({ error: 'NOT_FOUND', message: 'Project not found' }, 404)
  }

  if (project.status === 'generating') {
    return c.json({ error: 'ALREADY_GENERATING', message: 'Generation already in progress' }, 409)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return c.json({ error: 'CONFIGURATION_ERROR', message: 'ANTHROPIC_API_KEY not set' }, 500)
  }

  // Parse optional body for additional instructions
  let additionalInstructions: string | undefined
  try {
    const body = await c.req.json()
    additionalInstructions = body?.additionalInstructions
  } catch {
    // No body is fine
  }

  const template = getTemplate(project.templateId)
  if (!template) {
    return c.json({ error: 'NOT_FOUND', message: `Template '${project.templateId}' not found` }, 404)
  }

  updateProject(id, { status: 'generating' })

  const settings = {
    ...project.settings,
    ...(additionalInstructions ? { additionalInstructions } : {}),
  }

  return streamSSE(c, async (stream) => {
    try {
      let generatedMarkdown = ''

      for await (const event of generateSlides({
        inputText: project.inputText,
        template,
        settings,
        apiKey,
      })) {
        if (event.type === 'slide') {
          generatedMarkdown = event.markdown
        } else if (event.type === 'complete') {
          await stream.writeSSE({
            event: 'complete',
            data: JSON.stringify({
              totalSlides: event.totalSlides,
              slidesPath: `data/projects/${id}/slides.md`,
            }),
          })
        } else if (event.type === 'progress') {
          await stream.writeSSE({
            event: 'progress',
            data: JSON.stringify({
              stage: event.stage,
              message: event.message,
            }),
          })
        }
      }

      // Save slides and sync to Slidev preview
      if (generatedMarkdown) {
        saveSlides(id, generatedMarkdown)
        syncToSlidev(generatedMarkdown)
        updateProject(id, { status: 'generated' })
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Unknown error'

      let errorCode = 'GENERATION_FAILED'
      let userMessage = rawMessage

      if (/timeout|timed?\s*out|ETIMEDOUT|ECONNABORTED/i.test(rawMessage)) {
        errorCode = 'API_TIMEOUT'
        userMessage = 'The Claude API request timed out. Please retry — the API may be temporarily slow.'
      } else if (/rate\s*limit|429|too\s*many\s*requests/i.test(rawMessage)) {
        errorCode = 'RATE_LIMITED'
        userMessage = 'Rate limit reached. Please wait a minute before retrying.'
      } else if (/invalid.*api.*key|authentication|unauthorized|401|permission\s*denied/i.test(rawMessage)) {
        errorCode = 'INVALID_API_KEY'
        userMessage = 'Invalid or expired API key. Please check your ANTHROPIC_API_KEY configuration.'
      }

      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({
          error: errorCode,
          message: userMessage,
        }),
      })
      updateProject(id, { status: 'error' })
    }
  })
})

export { generateRoutes }
