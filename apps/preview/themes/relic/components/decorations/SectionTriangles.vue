<template>
  <div class="section-triangles">
    <div class="section-triangles__brown" />
    <div class="section-triangles__pink" />
    <div class="section-triangles__navy" />
  </div>
</template>

<style scoped>
.section-triangles { position: absolute; inset: 0; }

.section-triangles__brown,
.section-triangles__pink,
.section-triangles__navy {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
}

.section-triangles__brown {
  border-width: 0 0 100vh 380px;
  border-color: transparent transparent var(--color-secondary) transparent;
}

.section-triangles__pink {
  border-width: 0 0 100vh 370px;
  border-color: transparent transparent var(--color-accent) transparent;
}

.section-triangles__navy {
  border-width: 0 0 100vh 360px;
  border-color: transparent transparent var(--color-primary) transparent;
}
</style>
