import type { Template } from '@slidegen/shared'
import { generalTemplate } from './general.js'
import { proposalTemplate } from './proposal.js'
import { techTalkTemplate } from './tech-talk.js'

const templates: Record<string, Template> = {
  general: generalTemplate,
  proposal: proposalTemplate,
  'tech-talk': techTalkTemplate,
}

export function getTemplate(id: string): Template | undefined {
  return templates[id]
}

export function getAllTemplates(): Template[] {
  return Object.values(templates)
}

export function registerTemplate(template: Template): void {
  templates[template.id] = template
}
