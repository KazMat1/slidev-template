<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'small' | 'large'
}>(), {
  variant: 'small',
})
</script>

<template>
  <div :class="['cover-stripes', `cover-stripes--${variant}`]">
    <div class="cover-stripes__brown" />
    <div class="cover-stripes__navy" />
  </div>
</template>

<style scoped>
.cover-stripes { position: absolute; inset: 0; }

.cover-stripes__brown,
.cover-stripes__navy {
  position: absolute;
  height: 200%;
  transform: rotate(-25deg);
  transform-origin: top right;
}

/* Small variant (cover-1) */
.cover-stripes--small .cover-stripes__navy {
  width: 200px; top: -50%; right: 100px;
  background: var(--color-primary);
}
.cover-stripes--small .cover-stripes__brown {
  width: 180px; top: -50%; right: 160px;
  background: var(--color-secondary);
}

/* Large variant (cover-2) */
.cover-stripes--large .cover-stripes__navy {
  width: 280px; top: -80%; right: 40px;
  background: var(--color-primary);
  height: 250%;
}
.cover-stripes--large .cover-stripes__brown {
  width: 240px; top: -80%; right: 130px;
  background: var(--color-secondary);
  height: 250%;
}
</style>
