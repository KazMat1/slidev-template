<template>
  <div class="end-stripes">
    <div class="end-stripes__brown" />
    <div class="end-stripes__pink" />
    <div class="end-stripes__navy" />
  </div>
</template>

<style scoped>
.end-stripes { position: absolute; inset: 0; }

.end-stripes__brown,
.end-stripes__pink,
.end-stripes__navy {
  position: absolute;
  height: 250%;
  transform: rotate(-25deg);
  transform-origin: top right;
}

.end-stripes__brown {
  width: 240px; top: -80%; right: 60px;
  background: var(--color-secondary);
}

.end-stripes__pink {
  width: 8px; top: -80%; right: 295px;
  background: var(--color-accent);
}

.end-stripes__navy {
  width: 280px; top: -80%; right: -30px;
  background: var(--color-primary);
}
</style>
