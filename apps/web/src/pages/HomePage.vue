<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProjectCard from '../components/ProjectCard.vue'
import { useProject } from '../composables/useProject'

const router = useRouter()
const { openProject, deleteProject: deleteProjectFn } = useProject()

interface ProjectSummary {
  id: string
  name: string
  templateId: string
  status: string
  createdAt: string
  updatedAt: string
}

const projects = ref<ProjectSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadProjects()
})

async function loadProjects() {
  loading.value = true
  try {
    const res = await fetch('/api/projects')
    if (res.ok) {
      const data = await res.json()
      projects.value = data.projects
    }
  } catch {
    // Silently fail
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('このプロジェクトを削除しますか？')) return
  const deleted = await deleteProjectFn(id)
  if (deleted) {
    projects.value = projects.value.filter((p) => p.id !== id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">プロジェクト</h2>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        @click="router.push('/generate')"
      >
        + 新規作成
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">読み込み中...</div>
    <div v-else-if="projects.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg mb-4">プロジェクトはまだありません</p>
      <button
        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        @click="router.push('/generate')"
      >
        最初のスライドを生成する
      </button>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @open="openProject"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
