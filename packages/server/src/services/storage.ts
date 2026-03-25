import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ulid } from 'ulid'
import type { Project, ProjectSummary, GenerationSettings } from '@slidegen/shared'

const DATA_DIR = join(process.cwd(), '..', '..', 'data', 'projects')

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

function projectDir(id: string): string {
  return join(DATA_DIR, id)
}

function projectFilePath(id: string): string {
  return join(projectDir(id), 'project.json')
}

function slidesFilePath(id: string): string {
  return join(projectDir(id), 'slides.md')
}

export function createProject(params: {
  name: string
  inputText: string
  templateId: string
  settings: GenerationSettings
}): Project {
  const id = ulid()
  const now = new Date().toISOString()
  const project: Project = {
    id,
    name: params.name,
    inputText: params.inputText,
    templateId: params.templateId,
    settings: params.settings,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }

  ensureDir(projectDir(id))
  writeFileSync(projectFilePath(id), JSON.stringify(project, null, 2), 'utf-8')
  return project
}

export function getProject(id: string): Project | null {
  const path = projectFilePath(id)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8')) as Project
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const project = getProject(id)
  if (!project) return null

  const updated: Project = {
    ...project,
    ...updates,
    id: project.id,
    createdAt: project.createdAt,
    updatedAt: new Date().toISOString(),
  }

  writeFileSync(projectFilePath(id), JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

export function listProjects(): ProjectSummary[] {
  ensureDir(DATA_DIR)
  const dirs = readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())

  const projects: ProjectSummary[] = []
  for (const dir of dirs) {
    const project = getProject(dir.name)
    if (project) {
      projects.push({
        id: project.id,
        name: project.name,
        templateId: project.templateId,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
    }
  }

  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function deleteProject(id: string): boolean {
  const dir = projectDir(id)
  if (!existsSync(dir)) return false
  rmSync(dir, { recursive: true, force: true })
  return true
}

export function getSlides(id: string): string | null {
  const path = slidesFilePath(id)
  if (!existsSync(path)) return null
  return readFileSync(path, 'utf-8')
}

export function saveSlides(id: string, markdown: string): void {
  ensureDir(projectDir(id))
  writeFileSync(slidesFilePath(id), markdown, 'utf-8')
}

export function getProjectDir(id: string): string {
  return projectDir(id)
}
