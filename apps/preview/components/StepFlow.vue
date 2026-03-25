<script setup lang="ts">
defineProps<{
  steps: Array<{ number: number; label: string; color?: string }>
}>()
</script>

<template>
  <div class="flex items-center justify-center gap-4">
    <template v-for="(step, i) in steps" :key="step.number">
      <div
        class="p-4 rounded-lg text-center min-w-24"
        :class="step.color ? `bg-${step.color}-100` : 'bg-blue-100'"
      >
        <div class="text-2xl font-bold">{{ step.number }}</div>
        <div class="text-sm mt-1">{{ step.label }}</div>
      </div>
      <div v-if="i < steps.length - 1" class="text-2xl text-gray-400">→</div>
    </template>
  </div>
</template>
