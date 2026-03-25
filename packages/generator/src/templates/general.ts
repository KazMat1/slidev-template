import type { Template } from '@slidegen/shared'

export const generalTemplate: Template = {
  id: 'general',
  name: '一般プレゼン',
  description: '汎用的なプレゼンテーション向けのレイアウト構成。シンプルで見やすい構成。',
  layoutSequence: [
    { layout: 'cover', purpose: 'title' },
    { layout: 'default', purpose: 'agenda' },
    { layout: 'default', purpose: 'content' },
    { layout: 'section', purpose: 'section-break', optional: true },
    { layout: 'center', purpose: 'emphasis', optional: true },
    { layout: 'default', purpose: 'content' },
    { layout: 'default', purpose: 'summary' },
    { layout: 'end', purpose: 'closing' },
  ],
  components: [],
  promptTemplate: `あなたは一般的なプレゼンテーションスライドを作成するエキスパートです。
入力されたテキストを基に、明確で見やすいスライドを作成してください。

構成ガイドライン:
- 表紙(cover) → アジェンダ → 本文スライド群 → まとめ → 最終スライド(end)
- 内容に応じてセクション区切り(section)や強調(center)を適宜挿入
- 箇条書きは v-clicks で段階的に表示
- テキストが多い場合は適切にスライドを分割
- UnoCSS クラスでスタイリング（text-xl, font-bold, text-blue-500 等）`,
}
