<script setup lang="ts">
withDefaults(defineProps<{
  showFooter?: boolean
  showFooterLine?: boolean
  showLogo?: boolean
  footerTheme?: 'dark' | 'light'
  logoPosition?: 'bottom-right' | 'content'
}>(), {
  showFooter: false,
  showFooterLine: true,
  showLogo: false,
  footerTheme: 'dark',
  logoPosition: 'bottom-right',
})

const masterConfig = {
  copyright: 'Copyright \u00A9 2025 Example Corp. All Rights Reserved.',
  logoText: 'Example',
  logoTagline: 'Innovation for Everyone.',
}
</script>

<template>
  <div class="slide-master">
    <div class="slide-master__decoration">
      <slot name="decoration" />
    </div>
    <div class="slide-master__content">
      <slot />
    </div>
    <div
      v-if="showFooter"
      :class="['slide-master__footer', `slide-master__footer--${footerTheme}`]"
    >
      <div class="slide-master__footer-left">
        <span class="slide-master__footer-copyright">{{ masterConfig.copyright }}</span>
      </div>
      <span class="slide-master__footer-page">{{ $page }}</span>
    </div>
    <div v-if="showFooter && showFooterLine" class="slide-master__footer-line" />
  </div>
</template>

<style scoped>
.slide-master {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-white);
  overflow: hidden;
}
.slide-master__decoration { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.slide-master__content { position: relative; z-index: 2; width: 100%; height: 100%; }
.slide-master__footer {
  position: absolute; bottom: 12px; left: 24px; right: 24px;
  display: flex; justify-content: space-between; align-items: center; z-index: 4;
}
.slide-master__footer-left { display: flex; align-items: center; gap: 8px; }
.slide-master__footer--dark .slide-master__footer-copyright { color: var(--color-black); }
.slide-master__footer--dark .slide-master__footer-page { color: var(--color-black); }
.slide-master__footer-copyright { font-size: 9px; font-family: var(--font-en); }
.slide-master__footer-page { font-size: 12px; font-family: var(--font-en); }
.slide-master__footer-line {
  position: absolute; bottom: 36px; left: 20px; right: 20px;
  height: 1px; background: var(--color-black); z-index: 4;
}
</style>
