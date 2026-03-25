<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PreviewPanel from '../components/PreviewPanel.vue'
import GenerationProgress from '../components/GenerationProgress.vue'
import ExportButton from '../components/ExportButton.vue'
import TemplateSelector from '../components/TemplateSelector.vue'

const router = useRouter()

const inputText = ref('')
const selectedTemplate = ref('general')
const projectId = ref('')
const isGenerating = ref(false)
const isGenerated = ref(false)
const progressStage = ref('')
const progressMessage = ref('')
const error = ref('')

async function handleGenerate() {
  if (!inputText.value.trim()) return

  error.value = ''
  isGenerating.value = true
  isGenerated.value = false
  progressStage.value = 'starting'
  progressMessage.value = '生成を開始しています...'

  try {
    // Create project
    const createRes = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: inputText.value.slice(0, 50).replace(/\n/g, ' '),
        inputText: inputText.value,
        templateId: selectedTemplate.value,
        settings: {
          language: 'ja',
          slideCount: null,
          theme: 'default',
        },
      }),
    })

    if (!createRes.ok) {
      const data = await createRes.json()
      throw new Error(data.message || 'プロジェクト作成に失敗しました')
    }

    const project = await createRes.json()
    projectId.value = project.id

    // Start generation with SSE
    const genRes = await fetch(`/api/projects/${project.id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (!genRes.ok) {
      const data = await genRes.json()
      throw new Error(data.message || '生成開始に失敗しました')
    }

    // Read SSE stream
    const reader = genRes.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('ストリーム読み取りに失敗しました')

    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          // event type is parsed but we use the data line
        } else if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.stage) {
              progressStage.value = data.stage
              progressMessage.value = data.message || ''
            }
            if (data.totalSlides) {
              isGenerated.value = true
              isGenerating.value = false
            }
            if (data.error) {
              throw new Error(data.message || '生成エラー')
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    }

    isGenerating.value = false
    isGenerated.value = true
  } catch (err) {
    isGenerating.value = false
    error.value = err instanceof Error ? err.message : '生成に失敗しました'
  }
}

function goToEditor() {
  if (projectId.value) {
    router.push(`/editor/${projectId.value}`)
  }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold">スライド生成</h2>

    <!-- Input area -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        テキスト入力（箇条書き・自由記述）
      </label>
      <textarea
        v-model="inputText"
        class="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="スライドの内容を箇条書きで入力してください...&#10;&#10;例:&#10;- プロジェクトの背景と目的&#10;- 現状の課題（3点）&#10;- 提案するソリューション&#10;- 期待される効果&#10;- スケジュールと次のステップ"
        :disabled="isGenerating"
      />
      <div class="text-xs text-gray-400 mt-1">
        {{ inputText.length }} / 10,000 文字
      </div>
    </div>

    <!-- Template selector -->
    <TemplateSelector v-model="selectedTemplate" />

    <!-- Actions -->
    <div class="flex items-center gap-4">
      <button
        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        :disabled="!inputText.trim() || isGenerating"
        @click="handleGenerate"
      >
        {{ isGenerating ? '生成中...' : 'スライドを生成' }}
      </button>

      <ExportButton v-if="isGenerated" :project-id="projectId" />

      <button
        v-if="isGenerated"
        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
        @click="goToEditor"
      >
        エディタで編集
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Progress -->
    <GenerationProgress
      :stage="progressStage"
      :message="progressMessage"
      :is-generating="isGenerating"
    />

    <!-- Preview -->
    <PreviewPanel :visible="isGenerated" />
  </div>
</template>
