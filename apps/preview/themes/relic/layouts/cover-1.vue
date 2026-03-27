<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'
import CoverStripes from '../components/decorations/CoverStripes.vue'

defineProps<{
  title?: string
  subtitle1?: string
  subtitle2?: string
}>()
</script>

<template>
  <SlideMaster :showLogo="true" logoPosition="bottom-right">
    <template #decoration>
      <CoverStripes variant="small" />
    </template>
    <template #logo><slot name="logo" /></template>

    <div class="cover-1-body">
      <h1 class="cover-1-body__title">
        <slot name="title">{{ title || 'タイトルを入力' }}</slot>
      </h1>
      <div class="cover-1-body__subtitles">
        <div class="cover-1-body__pink-bar" />
        <div class="cover-1-body__subtitle-fields">
          <p class="cover-1-body__subtitle">{{ subtitle1 || 'テキストを入力' }}</p>
          <p class="cover-1-body__subtitle">{{ subtitle2 || 'テキストを入力' }}</p>
        </div>
      </div>
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.cover-1-body { padding: 60px 80px; }

.cover-1-body__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: 40px;
  max-width: 55%;
}

.cover-1-body__subtitles { display: flex; align-items: stretch; gap: 12px; }

.cover-1-body__pink-bar {
  width: 4px;
  background: var(--color-accent);
  border-radius: 2px;
}

.cover-1-body__subtitle-fields { display: flex; flex-direction: column; gap: 4px; }

.cover-1-body__subtitle {
  font-size: 14px;
  color: var(--color-black);
  padding: 6px 12px;
  border: 1px dashed #ccc;
  min-width: 300px;
}
</style>
