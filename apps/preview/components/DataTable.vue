<script setup lang="ts">
defineProps<{
  headers: string[]
  rows: string[][]
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th
            v-for="header in headers"
            :key="header"
            class="px-4 py-2 text-left font-semibold border-b-2 border-gray-300"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i" class="hover:bg-gray-50">
          <td
            v-for="(cell, j) in row"
            :key="j"
            class="px-4 py-2 border-b border-gray-200"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
