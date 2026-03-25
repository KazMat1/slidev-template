<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div v-if="visible" class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
    <div class="bg-gray-100 px-3 py-2 text-sm text-gray-500 border-b border-gray-200 flex items-center justify-between">
      <span>プレビュー</span>
      <a href="http://localhost:3030" target="_blank" class="text-blue-500 hover:text-blue-700 text-xs">
        新しいタブで開く ↗
      </a>
    </div>
    <iframe
      src="http://localhost:3030"
      class="w-full border-0"
      style="height: 500px"
      title="Slide Preview"
    />
  </div>
</template>
