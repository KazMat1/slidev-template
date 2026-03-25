<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)

watch(() => props.message, () => {
  visible.value = true
  if (props.duration !== 0) {
    setTimeout(() => {
      visible.value = false
      emit('close')
    }, props.duration || 3000)
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible && message"
      class="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium"
      :class="{
        'bg-green-500 text-white': type === 'success',
        'bg-red-500 text-white': type === 'error',
        'bg-blue-500 text-white': !type || type === 'info',
      }"
    >
      <div class="flex items-center gap-2">
        <span>{{ message }}</span>
        <button class="text-white/80 hover:text-white" @click="visible = false; emit('close')">✕</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
