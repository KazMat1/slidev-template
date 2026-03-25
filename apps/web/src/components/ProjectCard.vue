<script setup lang="ts">
defineProps<{
  project: {
    id: string
    name: string
    templateId: string
    status: string
    createdAt: string
    updatedAt: string
  }
}>()

const emit = defineEmits<{
  open: [id: string]
  delete: [id: string]
}>()

const statusLabels: Record<string, { text: string; color: string }> = {
  draft: { text: '下書き', color: 'gray' },
  generating: { text: '生成中', color: 'blue' },
  generated: { text: '生成済み', color: 'green' },
  editing: { text: '編集中', color: 'orange' },
  error: { text: 'エラー', color: 'red' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-gray-900 truncate">{{ project.name }}</h3>
        <div class="flex items-center gap-2 mt-1">
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="{
              'bg-gray-100 text-gray-600': project.status === 'draft',
              'bg-blue-100 text-blue-600': project.status === 'generating',
              'bg-green-100 text-green-600': project.status === 'generated',
              'bg-orange-100 text-orange-600': project.status === 'editing',
              'bg-red-100 text-red-600': project.status === 'error',
            }"
          >
            {{ statusLabels[project.status]?.text || project.status }}
          </span>
          <span class="text-xs text-gray-400">{{ project.templateId }}</span>
        </div>
      </div>
      <button
        class="text-gray-400 hover:text-red-500 text-sm ml-2"
        title="削除"
        @click.stop="emit('delete', project.id)"
      >
        ✕
      </button>
    </div>
    <div class="mt-3 flex items-center justify-between">
      <span class="text-xs text-gray-400">{{ formatDate(project.updatedAt) }}</span>
      <button
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        @click="emit('open', project.id)"
      >
        開く →
      </button>
    </div>
  </div>
</template>
