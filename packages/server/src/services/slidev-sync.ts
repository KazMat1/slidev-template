import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const PREVIEW_SLIDES_PATH = join(process.cwd(), '..', '..', 'apps', 'preview', 'slides.md')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Write markdown to the Slidev preview slides.md file.
 * Slidev's Vite file watcher will detect the change and trigger HMR.
 */
export function syncToSlidev(markdown: string): void {
  mkdirSync(dirname(PREVIEW_SLIDES_PATH), { recursive: true })
  writeFileSync(PREVIEW_SLIDES_PATH, markdown, 'utf-8')
}

/**
 * Debounced version of syncToSlidev for real-time editing.
 * Prevents overwhelming the file watcher during rapid edits.
 */
export function syncToSlidevDebounced(markdown: string, delayMs = 300): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    syncToSlidev(markdown)
    debounceTimer = null
  }, delayMs)
}
