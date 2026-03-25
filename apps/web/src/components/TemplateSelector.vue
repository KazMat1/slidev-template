<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TemplateSummary {
  id: string
  name: string
  description: string
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const templates = ref<TemplateSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/templates')
    if (res.ok) {
      const data = await res.json()
      templates.value = data.templates
    }
  } catch {
    // Fallback templates if API not available
    templates.value = [
      { id: 'general', name: '一般プレゼン', description: '汎用的なプレゼンテーション向け' },
      { id: 'proposal', name: '提案書', description: 'ビジネス提案書向け' },
      { id: 'tech-talk', name: '技術発表', description: '技術発表・LT向け' },
    ]
  } finally {
    loading.value = false
  }
})

function select(id: string) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">テンプレート選択</label>
    <div v-if="loading" class="text-sm text-gray-400">読み込み中...</div>
    <div v-else class="grid grid-cols-3 gap-3">
      <button
        v-for="t in templates"
        :key="t.id"
        class="p-4 border rounded-lg text-left transition-all"
        :class="props.modelValue === t.id
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
        @click="select(t.id)"
      >
        <div class="font-medium text-sm">{{ t.name }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ t.description }}</div>
      </button>
    </div>
  </div>
</template>
