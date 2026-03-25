import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useProject() {
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')

  async function openProject(id: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error('プロジェクトの読み込みに失敗しました')
      const project = await res.json()

      if (project.status === 'generated' || project.status === 'editing') {
        router.push(`/editor/${id}`)
      } else {
        router.push('/generate')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'エラーが発生しました'
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      return res.ok
    } catch {
      return false
    }
  }

  return { openProject, deleteProject, loading, error }
}
