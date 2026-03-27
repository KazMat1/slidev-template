<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'
</script>

<template>
  <SlideMaster>
    <div class="end-body">
      <slot>
        <p class="end-body__text">Thank you</p>
      </slot>
    </div>
  </SlideMaster>
</template>

<style scoped>
.end-body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.end-body__text {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
