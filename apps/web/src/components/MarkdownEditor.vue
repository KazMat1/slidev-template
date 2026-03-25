<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="bg-gray-100 px-3 py-2 text-sm text-gray-500 border-b border-gray-200 flex items-center justify-between">
      <span>マークダウンエディタ</span>
      <span class="text-xs">{{ modelValue.length }} 文字</span>
    </div>
    <textarea
      :value="props.modelValue"
      class="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none border-0"
      spellcheck="false"
      @input="onInput"
    />
  </div>
</template>
