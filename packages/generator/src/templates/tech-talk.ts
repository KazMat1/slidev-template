import type { Template } from '@slidegen/shared'

export const techTalkTemplate: Template = {
  id: 'tech-talk',
  name: '技術発表',
  description: '技術発表・LT向けのレイアウト構成。コードブロック、アーキテクチャ図配置を重視',
  layoutSequence: [
    { layout: 'cover', purpose: 'title' },
    { layout: 'default', purpose: 'agenda' },
    { layout: 'section', purpose: 'section-break' },
    { layout: 'default', purpose: 'background' },
    { layout: 'default', purpose: 'code-demo' },
    { layout: 'two-cols', purpose: 'code-explanation' },
    { layout: 'default', purpose: 'architecture' },
    { layout: 'image-right', purpose: 'diagram', optional: true },
    { layout: 'default', purpose: 'demo' },
    { layout: 'default', purpose: 'summary' },
    { layout: 'end', purpose: 'closing' },
  ],
  components: ['DataTable'],
  promptTemplate: `あなたは技術発表・LTのプレゼンテーションを作成するエキスパートです。

構成ガイドライン:
- 表紙(cover) → アジェンダ → 技術背景 → コードデモ → アーキテクチャ → まとめ → 最終スライド(end)
- コードブロックには必ず言語指定とハイライト行を付ける（例: \`\`\`ts {2-3|5|all}）
- 技術的な内容は two-cols で「コード + 説明」の形式を活用
- アーキテクチャ図は UnoCSS の grid/flex レイアウトで表現
- ライブデモの手順は v-clicks で段階的に表示
- 技術用語は正確に使用
- 聴衆が開発者であることを前提とした内容レベル
- データの比較には UnoCSS grid でテーブル風レイアウトを作成`,
}
