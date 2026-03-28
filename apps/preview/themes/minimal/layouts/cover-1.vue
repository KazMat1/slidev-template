<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'

defineProps<{
  title?: string
  subtitle1?: string
  subtitle2?: string
}>()
</script>

<template>
  <SlideMaster>
    <div class="cover-body">
      <h1 class="cover-body__title">
        <slot name="title">{{ title || 'タイトルを入力' }}</slot>
      </h1>
      <div class="cover-body__subtitles">
        <p class="cover-body__subtitle">{{ subtitle1 || 'テキストを入力' }}</p>
        <p class="cover-body__subtitle">{{ subtitle2 || 'テキストを入力' }}</p>
      </div>
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.cover-body {
  padding: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.cover-body__title {
  font-size: 40px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 24px;
}
.cover-body__subtitles { display: flex; flex-direction: column; gap: 8px; }
.cover-body__subtitle {
  font-size: 16px;
  color: var(--color-black);
  opacity: 0.7;
}
</style>
