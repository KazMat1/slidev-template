<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <RouterLink to="/" class="text-xl font-bold text-gray-800 no-underline">
          SlideGen
        </RouterLink>
        <nav class="flex gap-4 text-sm">
          <RouterLink to="/" class="text-gray-600 hover:text-gray-900 no-underline">
            プロジェクト
          </RouterLink>
          <RouterLink to="/generate" class="text-gray-600 hover:text-gray-900 no-underline">
            生成
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
