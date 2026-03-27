<!--
  SlideMaster — ReLic Theme Slide Master
-->
<script setup lang="ts">
import logoImage from '../assets/logo.png'

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
  copyright: 'Copyright \u00A9 2025 Relic Inc. All Rights Reserved.',
  logoText: 'ReLic',
  logoTagline: 'CO-INNOVATION COMPANY.',
  logoImage,
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
      v-if="showLogo && logoPosition === 'bottom-right'"
      class="slide-master__logo slide-master__logo--bottom-right"
    >
      <slot name="logo">
        <img
          v-if="masterConfig.logoImage"
          :src="masterConfig.logoImage"
          :alt="masterConfig.logoText"
          class="slide-master__logo-image"
        />
        <template v-else>
          <span class="slide-master__logo-text">{{ masterConfig.logoText }}</span>
          <span class="slide-master__logo-tagline">{{ masterConfig.logoTagline }}</span>
        </template>
      </slot>
    </div>

    <div
      v-if="showFooter"
      :class="['slide-master__footer', `slide-master__footer--${footerTheme}`]"
    >
      <div class="slide-master__footer-left">
        <div class="slide-master__footer-accent" />
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

.slide-master__decoration {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.slide-master__content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

/* Logo */
.slide-master__logo--bottom-right {
  position: absolute;
  bottom: 60px;
  right: 80px;
  z-index: 3;
}

.slide-master__logo-image {
  height: 64px;
  width: auto;
}

.slide-master__logo-text {
  font-family: Arial, sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #555;
}

.slide-master__logo-tagline {
  display: block;
  font-family: Arial, sans-serif;
  font-size: 10px;
  color: #666;
}

/* Footer */
.slide-master__footer {
  position: absolute;
  bottom: 12px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
}

.slide-master__footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slide-master__footer-accent {
  width: 4px;
  height: 16px;
  border-radius: 1px;
}

.slide-master__footer--dark .slide-master__footer-accent { background: var(--color-black); }
.slide-master__footer--dark .slide-master__footer-copyright { color: var(--color-black); }
.slide-master__footer--dark .slide-master__footer-page { color: var(--color-black); }

.slide-master__footer--light .slide-master__footer-accent { background: var(--color-white); }
.slide-master__footer--light .slide-master__footer-copyright { color: var(--color-white); }
.slide-master__footer--light .slide-master__footer-page { color: var(--color-white); }

.slide-master__footer-copyright {
  font-size: 9px;
  font-family: Arial, sans-serif;
}

.slide-master__footer-page {
  font-size: 12px;
  font-family: Arial, sans-serif;
}

.slide-master__footer-line {
  position: absolute;
  bottom: 36px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: var(--color-black);
  z-index: 4;
}
</style>
