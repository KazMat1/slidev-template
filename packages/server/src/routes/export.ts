import { Hono } from 'hono'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getProject, getSlides, getProjectDir } from '../services/storage.js'
import { syncToSlidev } from '../services/slidev-sync.js'

const exportRoutes = new Hono()

const PREVIEW_DIR = join(process.cwd(), '..', '..', 'apps', 'preview')

// POST /api/projects/:id/export
exportRoutes.post('/:id/export', async (c) => {
  const id = c.req.param('id')
  const project = getProject(id)
  if (!project) {
    return c.json({ error: 'NOT_FOUND', message: 'Project not found' }, 404)
  }

  const markdown = getSlides(id)
  if (!markdown) {
    return c.json({ error: 'NOT_FOUND', message: 'Slides not generated yet' }, 400)
  }

  // Sync slides to preview for export
  syncToSlidev(markdown)

  const outputPath = join(getProjectDir(id), 'export.pdf')

  return new Promise<Response>((resolve) => {
    const proc = spawn('npx', ['slidev', 'export', '--output', outputPath], {
      cwd: PREVIEW_DIR,
      env: { ...process.env },
    })

    let stderr = ''
    proc.stderr.on('data', (data) => { stderr += data.toString() })

    proc.on('close', (code) => {
      if (code !== 0) {
        resolve(c.json({
          error: 'EXPORT_FAILED',
          message: `Export failed: ${stderr}`,
        }, 500))
        return
      }

      resolve(c.json({
        exportPath: outputPath,
        downloadUrl: `/api/projects/${id}/export/download`,
      }))
    })

    proc.on('error', (err) => {
      resolve(c.json({
        error: 'EXPORT_FAILED',
        message: err.message,
      }, 500))
    })
  })
})

// GET /api/projects/:id/export/download
exportRoutes.get('/:id/export/download', async (c) => {
  const id = c.req.param('id')
  const outputPath = join(getProjectDir(id), 'export.pdf')

  if (!existsSync(outputPath)) {
    return c.json({ error: 'NOT_FOUND', message: 'Export file not found' }, 404)
  }

  const { readFileSync } = await import('node:fs')
  const pdf = readFileSync(outputPath)
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="slides.pdf"`,
    },
  })
})

export { exportRoutes }
