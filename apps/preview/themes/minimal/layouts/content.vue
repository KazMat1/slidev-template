<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'

defineProps<{}>()
</script>

<template>
  <SlideMaster :showFooter="true" :showFooterLine="true" footerTheme="dark">
    <div class="content-body">
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.content-body {
  padding: 48px 64px 56px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.content-body :deep(h1) {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 24px;
}
</style>
