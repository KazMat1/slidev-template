import { ref, watch, type Ref } from 'vue'

export function useAutoSave(
  content: Ref<string>,
  saveFn: (value: string) => Promise<void>,
  delayMs = 300
) {
  const isSaving = ref(false)
  const lastSaved = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(content, (newValue) => {
    if (newValue === lastSaved.value) return

    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      isSaving.value = true
      try {
        await saveFn(newValue)
        lastSaved.value = newValue
      } catch (err) {
        console.error('Auto-save failed:', err)
      } finally {
        isSaving.value = false
      }
    }, delayMs)
  })

  function initLastSaved(value: string) {
    lastSaved.value = value
  }

  return { isSaving, initLastSaved }
}
