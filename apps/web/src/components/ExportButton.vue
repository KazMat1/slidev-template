<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  projectId: string
}>()

const isExporting = ref(false)
const error = ref('')

async function handleExport() {
  isExporting.value = true
  error.value = ''

  try {
    const res = await fetch(`/api/projects/${props.projectId}/export`, {
      method: 'POST',
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Export failed')
    }

    const data = await res.json()

    // Trigger download
    const link = document.createElement('a')
    link.href = data.downloadUrl
    link.download = 'slides.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'エクスポートに失敗しました'
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div>
    <button
      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      :disabled="isExporting"
      @click="handleExport"
    >
      <span v-if="isExporting">エクスポート中...</span>
      <span v-else>PDF エクスポート</span>
    </button>
    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
  </div>
</template>
