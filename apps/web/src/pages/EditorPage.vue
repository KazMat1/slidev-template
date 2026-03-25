<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import PreviewPanel from '../components/PreviewPanel.vue'
import ExportButton from '../components/ExportButton.vue'
import RegeneratePanel from '../components/RegeneratePanel.vue'
import { useAutoSave } from '../composables/useAutoSave'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const markdown = ref('')
const loading = ref(true)
const error = ref('')

const { isSaving, initLastSaved } = useAutoSave(
  markdown,
  async (value) => {
    await fetch(`/api/projects/${projectId}/slides`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: value }),
    })
  },
  300
)

onMounted(async () => {
  try {
    const res = await fetch(`/api/projects/${projectId}/slides`)
    if (!res.ok) throw new Error('スライドの読み込みに失敗しました')
    const data = await res.json()
    markdown.value = data.markdown
    initLastSaved(data.markdown)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'エラーが発生しました'
  } finally {
    loading.value = false
  }
})

async function handleRegenerated() {
  const res = await fetch(`/api/projects/${projectId}/slides`)
  if (res.ok) {
    const data = await res.json()
    markdown.value = data.markdown
    initLastSaved(data.markdown)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="text-sm text-gray-500 hover:text-gray-700"
          @click="router.push('/generate')"
        >
          ← 生成画面に戻る
        </button>
        <h2 class="text-xl font-bold">スライド編集</h2>
        <span v-if="isSaving" class="text-xs text-gray-400">保存中...</span>
      </div>
      <ExportButton :project-id="projectId" />
    </div>

    <div v-if="loading" class="text-gray-500">読み込み中...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <template v-else>
      <RegeneratePanel :project-id="projectId" @regenerated="handleRegenerated" />

      <div class="grid grid-cols-2 gap-4" style="height: 600px">
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <MarkdownEditor v-model="markdown" />
        </div>
        <PreviewPanel :visible="true" />
      </div>
    </template>
  </div>
</template>
