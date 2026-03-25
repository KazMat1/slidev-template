<script setup lang="ts">
defineProps<{
  before: { title: string; items: string[] }
  after: { title: string; items: string[] }
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 class="text-lg font-bold text-red-700 mb-4">{{ before.title }}</h3>
      <ul class="space-y-2">
        <li v-for="item in before.items" :key="item" class="flex items-start gap-2 text-red-600">
          <span class="text-red-400 mt-0.5">✗</span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
    <div class="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 class="text-lg font-bold text-green-700 mb-4">{{ after.title }}</h3>
      <ul class="space-y-2">
        <li v-for="item in after.items" :key="item" class="flex items-start gap-2 text-green-600">
          <span class="text-green-400 mt-0.5">✓</span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
