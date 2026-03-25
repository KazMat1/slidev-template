<script setup lang="ts">
defineProps<{
  stage: string
  message: string
  isGenerating: boolean
}>()
</script>

<template>
  <div v-if="isGenerating" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div class="flex items-center gap-3">
      <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
      <div>
        <div class="text-sm font-medium text-blue-800">{{ message }}</div>
        <div class="text-xs text-blue-500 mt-1">ステージ: {{ stage }}</div>
      </div>
    </div>
  </div>
</template>
