<script setup lang="ts">
defineProps<{
  headers: string[]
  rows: string[][]
  rowHeaders?: boolean
}>()
</script>

<template>
  <div class="data-table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="(header, i) in headers" :key="i" class="data-table__header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td
            v-for="(cell, j) in row"
            :key="j"
            :class="['data-table__cell', { 'data-table__cell--row-header': rowHeaders && j === 0 }]"
          >{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-wrapper { overflow-x: auto; width: 100%; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12pt; }
.data-table__header {
  background: var(--color-primary, #2563EB);
  color: var(--color-white, #FFFFFF);
  padding: 10px 16px; text-align: left; font-weight: 500; border: none;
}
.data-table__cell { padding: 10px 16px; border: none; color: var(--color-black, #1F2937); }
.data-table tbody tr:nth-child(odd) .data-table__cell { background: var(--color-white, #FFFFFF); }
.data-table tbody tr:nth-child(even) .data-table__cell { background: var(--color-gray, #F3F4F6); }
.data-table__cell--row-header {
  background: var(--color-secondary, #7C3AED) !important;
  color: var(--color-white, #FFFFFF); font-weight: 500;
}
</style>
