<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  projectId: string
}>()

const emit = defineEmits<{
  regenerated: []
}>()

const instructions = ref('')
const isRegenerating = ref(false)
const error = ref('')

async function handleRegenerate() {
  if (!instructions.value.trim()) return
  isRegenerating.value = true
  error.value = ''

  try {
    const res = await fetch(`/api/projects/${props.projectId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additionalInstructions: instructions.value }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || '再生成に失敗しました')
    }

    // Read SSE stream until complete
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    if (!reader) throw new Error('ストリーム読み取りに失敗しました')

    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.totalSlides) {
              emit('regenerated')
            }
            if (data.error) {
              throw new Error(data.message)
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    }

    instructions.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '再生成に失敗しました'
  } finally {
    isRegenerating.value = false
  }
}
</script>

<template>
  <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <h3 class="text-sm font-medium text-gray-700 mb-2">追加指示で再生成</h3>
    <div class="flex gap-2">
      <input
        v-model="instructions"
        type="text"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="例: もっと簡潔に、図を追加して"
        :disabled="isRegenerating"
        @keydown.enter="handleRegenerate"
      />
      <button
        class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm font-medium whitespace-nowrap"
        :disabled="!instructions.trim() || isRegenerating"
        @click="handleRegenerate"
      >
        {{ isRegenerating ? '再生成中...' : '再生成' }}
      </button>
    </div>
    <p v-if="error" class="text-red-500 text-xs mt-2">{{ error }}</p>
  </div>
</template>
