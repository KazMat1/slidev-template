<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'
import EndStripes from '../components/decorations/EndStripes.vue'
import logoImage from '../assets/logo.png'
</script>

<template>
  <SlideMaster>
    <template #decoration>
      <EndStripes />
    </template>

    <div class="end-body">
      <div class="end-body__text">
        <slot>
          <p>大志ある挑戦を創造し、日本から世界へ</p>
          <p>想いを持った挑戦者と共に走り、共に創る</p>
        </slot>
      </div>
      <div class="end-body__logo">
        <slot name="logo">
          <img
            v-if="logoImage"
            :src="logoImage"
            alt="ReLic"
            class="end-body__logo-image"
          />
        </slot>
      </div>
    </div>
  </SlideMaster>
</template>

<style scoped>
.end-body {
  padding: 120px 80px;
  max-width: 55%;
}

.end-body__text :deep(p) {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-black);
  line-height: 1.8;
}

.end-body__logo { margin-top: 40px; }

.end-body__logo-image {
  height: 80px;
  width: auto;
}
</style>
