import Anthropic from '@anthropic-ai/sdk'
import type { Template, GenerationSettings, GenerationEvent } from '@slidegen/shared'
import { buildPrompt } from './prompt-builder.js'

const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

// ---------------------------------------------------------------------------
// Input preprocessing — detect edge cases and produce additional prompt hints
// ---------------------------------------------------------------------------

interface PreprocessResult {
  processedText: string
  hints: string[]
}

function preprocessInput(inputText: string): PreprocessResult {
  const nonEmptyLines = inputText.split('\n').filter((line) => line.trim().length > 0)
  const lineCount = nonEmptyLines.length
  const hints: string[] = []

  if (lineCount < 3) {
    hints.push(
      'The input is very short. Generate a minimal presentation consisting of a title slide, ' +
        '1-2 content slides that expand on the input, and an end slide.',
    )
  }

  if (lineCount > 100) {
    hints.push(
      'The input is very long. Group related topics into clearly separated sections and ' +
        'create no more than 30 slides in total. Prioritize the most important points and ' +
        'summarize or merge less critical details.',
    )
  }

  return { processedText: inputText, hints }
}

/**
 * Generate Slidev slides using Claude API with streaming.
 * Yields GenerationEvent objects for SSE consumption.
 */
export async function* generateSlides(params: {
  inputText: string
  template: Template
  settings: GenerationSettings
  apiKey: string
}): AsyncGenerator<GenerationEvent> {
  const { inputText, template, settings, apiKey } = params

  yield { type: 'progress', stage: 'analyzing', message: '入力テキストを分析中...' }

  // Pre-process input to detect edge cases and build additional hints
  const { processedText, hints } = preprocessInput(inputText)

  // Merge hints into settings.additionalInstructions
  const mergedSettings: GenerationSettings = { ...settings }
  if (hints.length > 0) {
    const hintsBlock = hints.join('\n')
    mergedSettings.additionalInstructions = mergedSettings.additionalInstructions
      ? `${mergedSettings.additionalInstructions}\n${hintsBlock}`
      : hintsBlock
  }

  const { systemPrompt, userPrompt } = buildPrompt({
    inputText: processedText,
    template,
    settings: mergedSettings,
  })

  yield { type: 'progress', stage: 'generating', message: 'スライドを生成中...' }

  const client = new Anthropic({ apiKey })

  let fullContent = ''

  const stream = client.messages.stream({
    model: DEFAULT_MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let slideCount = 0

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text

      // Count slides by counting --- separators
      const newSlideCount = (fullContent.match(/^---$/gm) || []).length
      if (newSlideCount > slideCount) {
        slideCount = newSlideCount
        yield {
          type: 'progress',
          stage: 'generating',
          message: `スライド ${slideCount} を生成中...`,
        }
      }
    }
  }

  // Clean up the output - remove any markdown code fences that might wrap the content
  let markdown = fullContent.trim()
  if (markdown.startsWith('```markdown')) {
    markdown = markdown.slice('```markdown'.length)
  }
  if (markdown.startsWith('```md')) {
    markdown = markdown.slice('```md'.length)
  }
  if (markdown.startsWith('```')) {
    markdown = markdown.slice(3)
  }
  if (markdown.endsWith('```')) {
    markdown = markdown.slice(0, -3)
  }
  markdown = markdown.trim()

  // Count final slides
  const totalSlides = (markdown.match(/^---$/gm) || []).length + 1

  yield {
    type: 'complete',
    totalSlides,
    slidesPath: '',
  }

  // Return the full markdown as the final yield
  yield {
    type: 'slide',
    slideIndex: 0,
    markdown,
  }
}
