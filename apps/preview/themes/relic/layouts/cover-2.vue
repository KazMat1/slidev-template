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
      <CoverStripes variant="large" />
    </template>
    <template #logo><slot name="logo" /></template>

    <div class="cover-2-body">
      <h1 class="cover-2-body__title">
        <slot name="title">{{ title || 'タイトルを入力' }}</slot>
      </h1>
      <div class="cover-2-body__subtitles">
        <div class="cover-2-body__pink-bar" />
        <div class="cover-2-body__subtitle-fields">
          <p class="cover-2-body__subtitle">{{ subtitle1 || 'テキストを入力' }}</p>
          <p class="cover-2-body__subtitle">{{ subtitle2 || 'テキストを入力' }}</p>
        </div>
      </div>
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.cover-2-body { padding: 60px 80px; }

.cover-2-body__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: 40px;
  max-width: 50%;
}

.cover-2-body__subtitles { display: flex; align-items: stretch; gap: 12px; }

.cover-2-body__pink-bar {
  width: 4px;
  background: var(--color-accent);
  border-radius: 2px;
}

.cover-2-body__subtitle-fields { display: flex; flex-direction: column; gap: 4px; }

.cover-2-body__subtitle {
  font-size: 14px;
  color: var(--color-black);
  padding: 6px 12px;
  border: 1px dashed #ccc;
  min-width: 300px;
}
</style>
