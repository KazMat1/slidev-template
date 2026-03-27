<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'
import SectionTriangles from '../components/decorations/SectionTriangles.vue'

defineProps<{}>()
</script>

<template>
  <SlideMaster :showFooter="true" footerTheme="light">
    <template #decoration>
      <SectionTriangles />
    </template>

    <div class="section-body">
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.section-body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 45%;
  padding-right: 10%;
}

.section-body :deep(h1) {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-black);
}
</style>
