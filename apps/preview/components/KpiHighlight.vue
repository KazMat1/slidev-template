<script setup lang="ts">
defineProps<{
  value: string
  label: string
  color?: string
}>()
</script>

<template>
  <div class="text-center">
    <div class="text-5xl font-bold" :class="color ? `text-${color}-500` : 'text-blue-500'">
      {{ value }}
    </div>
    <div class="text-gray-500 mt-2 text-lg">{{ label }}</div>
  </div>
</template>
