// Project status
export type ProjectStatus = 'draft' | 'generating' | 'generated' | 'editing' | 'error'

// Generation settings embedded in Project
export interface GenerationSettings {
  language: 'ja' | 'en'
  slideCount: number | null
  theme: string
  additionalInstructions?: string
}

// Project entity - stored as data/projects/{id}/project.json
export interface Project {
  id: string
  name: string
  inputText: string
  templateId: string
  settings: GenerationSettings
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

// Project summary for list views
export interface ProjectSummary {
  id: string
  name: string
  templateId: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

// Layout hint for templates
export interface LayoutHint {
  layout: string
  purpose: string
  optional?: boolean
}

// Template definition
export interface Template {
  id: string
  name: string
  description: string
  layoutSequence: LayoutHint[]
  components: string[]
  promptTemplate: string
}

// API error response
export interface ApiError {
  error: string
  message: string
  details?: Array<{ field: string; message: string }>
}

// Generation SSE events
export type GenerationEvent =
  | { type: 'progress'; stage: string; message: string }
  | { type: 'slide'; slideIndex: number; markdown: string }
  | { type: 'complete'; totalSlides: number; slidesPath: string }
  | { type: 'error'; error: string; message: string }
