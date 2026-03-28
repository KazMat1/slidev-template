<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'
import borderImage from '../assets/border.png'

defineProps<{}>()
</script>

<template>
  <SlideMaster :showFooter="true" :showFooterLine="false" footerTheme="dark">
    <template #decoration>
      <img
        :src="borderImage"
        class="content-border"
        alt=""
        aria-hidden="true"
      />
    </template>

    <div class="content-body">
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.content-border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.content-body {
  padding: 48px 64px 56px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-body :deep(h1) {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}
</style>
